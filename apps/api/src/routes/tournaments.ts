import type { FastifyPluginAsync } from "fastify";
import { createTournamentInputSchema, tournamentSchema, updateTournamentInputSchema, updateTournamentTeamsInputSchema } from "@soccer-stats/shared";
import type { TournamentRound } from "@soccer-stats/shared";
import { tournamentRouteSchemas } from "../docs/openapi.js";
import { createId, slugify } from "../lib/ids.js";
import { calculateStandings } from "../lib/stats-service.js";
import { AuditService } from "../modules/audit/audit.service.js";

const canManageTournament = async (app: Parameters<FastifyPluginAsync>[0], userId: string, tournamentId: string) => {
  const tournament = await app.repositories.tournaments.findById(tournamentId);

  if (!tournament) {
    return null;
  }

  if (tournament.ownerId === userId) {
    return tournament;
  }

  const teams = await app.repositories.teams.listByIds(tournament.teamIds);
  const canManage = teams.some((team) =>
    team.members.some((member) => member.userId === userId && (member.role === "owner" || member.role === "admin"))
  );

  return canManage ? tournament : null;
};

const buildLeagueRounds = (teamIds: string[]): TournamentRound[] => {
  const teams = teamIds.length % 2 === 0 ? [...teamIds] : [...teamIds, "__bye__"];
  const rounds: TournamentRound[] = [];
  const totalRounds = teams.length - 1;
  let rotation = [...teams];

  for (let round = 1; round <= totalRounds; round += 1) {
    const pairings = [];

    for (let index = 0; index < rotation.length / 2; index += 1) {
      const homeTeamId = rotation[index];
      const awayTeamId = rotation[rotation.length - 1 - index];

      if (homeTeamId && awayTeamId && homeTeamId !== "__bye__" && awayTeamId !== "__bye__") {
        pairings.push({ homeTeamId, awayTeamId });
      }
    }

    rounds.push({ round, pairings, createdAt: new Date().toISOString() });
    rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)].filter((teamId): teamId is string => Boolean(teamId));
  }

  return rounds;
};

export const tournamentRoutes: FastifyPluginAsync = async (app) => {
  app.get("/tournaments", { schema: tournamentRouteSchemas.list }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const teams = await app.repositories.teams.listByMember(user.id);
    const tournaments = await app.repositories.tournaments.listByOwnerOrTeam(
      user.id,
      teams.map((team) => team.id)
    );

    return { tournaments: tournaments.map((item) => tournamentSchema.parse(item)) };
  });

  app.get("/tournaments/:tournamentId", { schema: tournamentRouteSchemas.get }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { tournamentId } = request.params as { tournamentId: string };
    const teams = await app.repositories.teams.listByMember(user.id);
    const tournaments = await app.repositories.tournaments.listByOwnerOrTeam(user.id, teams.map((team) => team.id));
    const tournament = tournaments.find((item) => item.id === tournamentId);

    if (!tournament) {
      reply.code(404);
      return { message: "Campeonato nao encontrado." };
    }

    return { tournament: tournamentSchema.parse(tournament) };
  });

  app.post("/tournaments", { schema: tournamentRouteSchemas.create }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const payload = createTournamentInputSchema.parse(request.body);
    const teams = await app.repositories.teams.listByIds(payload.teamIds);

    if (teams.length !== payload.teamIds.length) {
      reply.code(400);
      return { message: "Algum time nao foi encontrado." };
    }

    const manageable = teams.every((team) =>
      team.members.some((member) => member.userId === user.id && (member.role === "owner" || member.role === "admin"))
    );

    if (!manageable) {
      reply.code(403);
      return { message: "Voce precisa ser admin dos times informados." };
    }

    const now = new Date().toISOString();
    const tournament = await app.repositories.tournaments.create({
      id: createId(),
      name: payload.name,
      slug: `${slugify(payload.name)}-${createId().slice(0, 6)}`,
      ownerId: user.id,
      format: "league",
      visibility: payload.visibility,
      teamIds: payload.teamIds,
      matchIds: [],
      rounds: [],
      standings: calculateStandings(teams, []),
      createdAt: now,
      updatedAt: now
    });

    return { tournament: tournamentSchema.parse(tournament) };
  });

  app.patch("/tournaments/:tournamentId", { schema: tournamentRouteSchemas.update }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { tournamentId } = request.params as { tournamentId: string };
    const payload = updateTournamentInputSchema.parse(request.body);
    const tournament = await canManageTournament(app, user.id, tournamentId);

    if (!tournament) {
      reply.code(403);
      return { message: "Sem permissao para editar campeonato." };
    }

    const updated = await app.repositories.tournaments.update({
      ...tournament,
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.visibility ? { visibility: payload.visibility } : {}),
      updatedAt: new Date().toISOString()
    });

    return { tournament: tournamentSchema.parse(updated) };
  });

  app.post("/tournaments/:tournamentId/teams", { schema: tournamentRouteSchemas.addTeams }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { tournamentId } = request.params as { tournamentId: string };
    const payload = updateTournamentTeamsInputSchema.parse(request.body);
    const tournament = await canManageTournament(app, user.id, tournamentId);

    if (!tournament) {
      reply.code(403);
      return { message: "Sem permissao para editar campeonato." };
    }

    const matches = await app.repositories.matches.listByTournamentId(tournament.id);

    if (matches.some((match) => match.status === "completed")) {
      reply.code(409);
      return { message: "Nao e possivel alterar times depois de partidas concluidas." };
    }

    const teamIds = [...new Set([...tournament.teamIds, ...payload.teamIds])];
    const teams = await app.repositories.teams.listByIds(teamIds);

    if (teams.length !== teamIds.length) {
      reply.code(400);
      return { message: "Algum time nao foi encontrado." };
    }

    const updated = await app.repositories.tournaments.update({
      ...tournament,
      teamIds,
      rounds: [],
      standings: calculateStandings(teams, []),
      updatedAt: new Date().toISOString()
    });

    return { tournament: tournamentSchema.parse(updated) };
  });

  app.delete("/tournaments/:tournamentId/teams/:teamId", { schema: tournamentRouteSchemas.removeTeam }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { tournamentId, teamId } = request.params as { tournamentId: string; teamId: string };
    const tournament = await canManageTournament(app, user.id, tournamentId);

    if (!tournament) {
      reply.code(403);
      return { message: "Sem permissao para editar campeonato." };
    }

    const matches = await app.repositories.matches.listByTournamentId(tournament.id);

    if (matches.some((match) => match.status === "completed")) {
      reply.code(409);
      return { message: "Nao e possivel alterar times depois de partidas concluidas." };
    }

    const teamIds = tournament.teamIds.filter((id) => id !== teamId);

    if (teamIds.length < 2) {
      reply.code(400);
      return { message: "Campeonato precisa manter ao menos dois times." };
    }

    const teams = await app.repositories.teams.listByIds(teamIds);
    const updated = await app.repositories.tournaments.update({
      ...tournament,
      teamIds,
      rounds: [],
      standings: calculateStandings(teams, []),
      updatedAt: new Date().toISOString()
    });

    return { tournament: tournamentSchema.parse(updated) };
  });

  app.post("/tournaments/:tournamentId/rounds/generate", { schema: tournamentRouteSchemas.generateRounds }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { tournamentId } = request.params as { tournamentId: string };
    const tournament = await canManageTournament(app, user.id, tournamentId);

    if (!tournament) {
      reply.code(403);
      return { message: "Sem permissao para gerar rodadas." };
    }

    const rounds = buildLeagueRounds(tournament.teamIds);
    const updated = await app.repositories.tournaments.update({
      ...tournament,
      rounds,
      updatedAt: new Date().toISOString()
    });
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "tournament.rounds-generate",
      resourceType: "tournament",
      resourceId: tournament.id
    });

    return { tournament: tournamentSchema.parse(updated) };
  });
};
