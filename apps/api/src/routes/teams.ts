import type { FastifyPluginAsync } from "fastify";
import { createEmptyStats, createInviteInputSchema, createTeamInputSchema, inviteSchema, teamSchema } from "@soccer-stats/shared";
import { teamRouteSchemas } from "../docs/openapi.js";
import { createId, slugify } from "../lib/ids.js";

const ensureTeamPermission = (teamId: string, userId: string, app: Parameters<FastifyPluginAsync>[0]) =>
  app.repositories.teams.findById(teamId).then((team) => {
    if (!team) {
      return null;
    }

    return team.members.some((member) => member.userId === userId && (member.role === "owner" || member.role === "admin"))
      ? team
      : undefined;
  });

export const teamRoutes: FastifyPluginAsync = async (app) => {
  app.get("/teams", { schema: teamRouteSchemas.list }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const teams = await app.repositories.teams.listByMember(user.id);
    return { teams: teams.map((team) => teamSchema.parse(team)) };
  });

  app.post("/teams", { schema: teamRouteSchemas.create }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const payload = createTeamInputSchema.parse(request.body);
    const now = new Date().toISOString();
    const team = await app.repositories.teams.create({
      id: createId(),
      name: payload.name,
      slug: `${slugify(payload.name)}-${createId().slice(0, 6)}`,
      ownerId: user.id,
      members: [{ userId: user.id, role: "owner", joinedAt: now }],
      stats: createEmptyStats(),
      createdAt: now,
      updatedAt: now
    });

    return { team: teamSchema.parse(team) };
  });

  app.post("/teams/invites", { schema: teamRouteSchemas.invite }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const payload = createInviteInputSchema.parse(request.body);

    if (payload.resourceType !== "team") {
      reply.code(400);
      return { message: "Convite invalido para esta rota." };
    }

    const team = await ensureTeamPermission(payload.resourceId, user.id, app);

    if (!team) {
      reply.code(403);
      return { message: "Sem permissao para convidar." };
    }

    const invite = await app.repositories.invites.create({
      id: createId(),
      ...payload,
      status: "pending",
      invitedBy: user.id,
      createdAt: new Date().toISOString()
    });

    return { invite: inviteSchema.parse(invite) };
  });
};
