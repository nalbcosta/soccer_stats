import type { FastifyPluginAsync } from "fastify";
import { matchSchema, createMatchInputSchema, completeMatchInputSchema } from "@soccer-stats/shared";
import type { Match, MatchEvent, MatchVenue, Team } from "@soccer-stats/shared";
import { matchRouteSchemas } from "../docs/openapi.js";
import { calculatePlayerStats, calculateStandings, calculateTeamStats } from "../lib/stats-service.js";
import { createId } from "../lib/ids.js";

const canManageTeam = (userId: string, team: Team | null): team is Team =>
  Boolean(team?.members.some((member) => member.userId === userId && (member.role === "owner" || member.role === "admin")));

type LooseVenue = {
  name?: string | undefined;
  address?: string | undefined;
  surface?: MatchVenue["surface"] | undefined;
};

type LooseMatchEvent = Omit<MatchEvent, "assistPlayerId"> & {
  assistPlayerId?: string | undefined;
};

const cleanVenue = (venue: LooseVenue | undefined): MatchVenue | undefined => {
  if (!venue?.name && !venue?.address && !venue?.surface) {
    return undefined;
  }

  return {
    ...(venue.name ? { name: venue.name } : {}),
    ...(venue.address ? { address: venue.address } : {}),
    ...(venue.surface ? { surface: venue.surface } : {})
  };
};

const cleanEventLog = (eventLog: LooseMatchEvent[]): MatchEvent[] =>
  eventLog.map((event) => ({
    minute: event.minute,
    type: event.type,
    playerId: event.playerId,
    teamId: event.teamId,
    ...(event.assistPlayerId ? { assistPlayerId: event.assistPlayerId } : {})
  }));

export const matchRoutes: FastifyPluginAsync = async (app) => {
  app.get("/matches", { schema: matchRouteSchemas.list }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const teams = await app.repositories.teams.listByMember(user.id);
    const matches = await app.repositories.matches.listByTeamIds(teams.map((team) => team.id));
    return { matches: matches.map((match) => matchSchema.parse(match)) };
  });

  app.post("/matches", { schema: matchRouteSchemas.create }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const payload = createMatchInputSchema.parse(request.body);
    const [rawHomeTeam, rawAwayTeam] = await Promise.all([
      app.repositories.teams.findById(payload.home.teamId),
      app.repositories.teams.findById(payload.away.teamId)
    ]);
    const homeTeam = canManageTeam(user.id, rawHomeTeam) ? rawHomeTeam : null;
    const awayTeam = canManageTeam(user.id, rawAwayTeam) ? rawAwayTeam : null;

    if (!homeTeam || !awayTeam) {
      reply.code(403);
      return { message: "Sem permissao para registrar uma das equipes." };
    }

    if (payload.type === "tournament" && payload.tournamentId) {
      const tournament = await app.repositories.tournaments.findById(payload.tournamentId);

      if (!tournament || !tournament.teamIds.includes(homeTeam.id) || !tournament.teamIds.includes(awayTeam.id)) {
        reply.code(400);
        return { message: "Partida nao compativel com o campeonato." };
      }
    }

    const now = new Date().toISOString();
    const venue = cleanVenue(payload.venue);
    const matchBase: Match = {
      id: createId(),
      type: payload.type,
      status: "scheduled",
      createdBy: user.id,
      home: payload.home,
      away: payload.away,
      eventLog: [],
      ...(payload.durationMinutes ? { durationMinutes: payload.durationMinutes } : {}),
      ...(venue ? { venue } : {}),
      playedAt: payload.playedAt,
      createdAt: now,
      updatedAt: now
    };
    const match = await app.repositories.matches.create(
      payload.tournamentId ? { ...matchBase, tournamentId: payload.tournamentId } : matchBase
    );

    return { match: matchSchema.parse(match) };
  });

  app.post("/matches/complete", { schema: matchRouteSchemas.complete }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const payload = completeMatchInputSchema.parse(request.body);
    const match = await app.repositories.matches.findById(payload.id);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    const [homeTeam, awayTeam] = await Promise.all([
      app.repositories.teams.findById(match.home.teamId),
      app.repositories.teams.findById(match.away.teamId)
    ]);

    if (!canManageTeam(user.id, homeTeam) || !canManageTeam(user.id, awayTeam)) {
      reply.code(403);
      return { message: "Sem permissao para encerrar a partida." };
    }

    const venue = cleanVenue(payload.venue);
    const completed = await app.repositories.matches.update({
      ...match,
      status: "completed",
      home: { ...match.home, score: payload.homeScore },
      away: { ...match.away, score: payload.awayScore },
      eventLog: cleanEventLog(payload.eventLog),
      ...(payload.durationMinutes ? { durationMinutes: payload.durationMinutes } : {}),
      ...(venue ? { venue } : {}),
      updatedAt: new Date().toISOString()
    });

    const involvedTeams: Team[] = [homeTeam, awayTeam].filter((team): team is Team => Boolean(team));
    const teamMatches = await app.repositories.matches.listByTeamIds(involvedTeams.map((team) => team.id));

    await Promise.all(
      involvedTeams.map(async (team) => {
        const stats = calculateTeamStats(team, teamMatches);
        await app.repositories.teams.update({
          ...team,
          stats,
          updatedAt: new Date().toISOString()
        });
      })
    );

    const uniquePlayerIds = [...new Set([...completed.home.playerIds, ...completed.away.playerIds])];
    const playerMatches = await app.repositories.matches.listByTeamIds([completed.home.teamId, completed.away.teamId]);

    await Promise.all(
      uniquePlayerIds.map(async (playerId) => {
        const profile = await app.repositories.playerProfiles.findByUserId(playerId);

        if (!profile) {
          return;
        }

        const stats = calculatePlayerStats(playerId, playerMatches);
        await app.repositories.playerProfiles.upsert({ ...profile, stats });
      })
    );

    if (completed.tournamentId) {
      const tournament = await app.repositories.tournaments.findById(completed.tournamentId);

      if (tournament) {
        const teams = await app.repositories.teams.listByIds(tournament.teamIds);
        const matches = await app.repositories.matches.listByTournamentId(tournament.id);
        await app.repositories.tournaments.update({
          ...tournament,
          matchIds: [...new Set([...tournament.matchIds, completed.id])],
          standings: calculateStandings(teams, matches),
          updatedAt: new Date().toISOString()
        });
      }
    }

    return { match: matchSchema.parse(completed) };
  });
};
