import type { FastifyPluginAsync } from "fastify";
import { createTournamentInputSchema, tournamentSchema } from "@soccer-stats/shared";
import { tournamentRouteSchemas } from "../docs/openapi.js";
import { createId, slugify } from "../lib/ids.js";
import { calculateStandings } from "../lib/stats-service.js";

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
      standings: calculateStandings(teams, []),
      createdAt: now,
      updatedAt: now
    });

    return { tournament: tournamentSchema.parse(tournament) };
  });
};
