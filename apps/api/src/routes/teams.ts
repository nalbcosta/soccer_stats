import type { FastifyPluginAsync } from "fastify";
import { createEmptyStats, createInviteInputSchema, createTeamInputSchema, inviteSchema, teamSchema } from "@soccer-stats/shared";
import { teamRouteSchemas } from "../docs/openapi.js";
import { createId, slugify } from "../lib/ids.js";
import { NotificationService } from "../modules/notifications/notification.service.js";

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

    const teams = await app.repositories.teams.listVisibleToUser(user.id);
    return { teams: teams.map((team) => teamSchema.parse(team)) };
  });

  app.get("/teams/:teamId", { schema: teamRouteSchemas.get }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { teamId } = request.params as { teamId: string };
    const team = await app.repositories.teams.findById(teamId);

    if (!team || (team.visibility !== "public" && !team.members.some((member) => member.userId === user.id))) {
      reply.code(404);
      return { message: "Time nao encontrado." };
    }

    return { team: teamSchema.parse(team) };
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
      visibility: payload.visibility,
      ...(payload.city ? { city: payload.city } : {}),
      ...(payload.state ? { state: payload.state.toUpperCase() } : {}),
      members: [{ userId: user.id, role: "owner", joinedAt: now }],
      stats: createEmptyStats(),
      createdAt: now,
      updatedAt: now
    });

    return { team: teamSchema.parse(team) };
  });

  app.patch("/teams/:teamId", { schema: teamRouteSchemas.update }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { teamId } = request.params as { teamId: string };
    const payload = createTeamInputSchema.partial().parse(request.body);
    const team = await ensureTeamPermission(teamId, user.id, app);

    if (!team) {
      reply.code(403);
      return { message: "Sem permissao para editar este time." };
    }

    const updated = await app.repositories.teams.update({
      ...team,
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.visibility ? { visibility: payload.visibility } : {}),
      ...(payload.city ? { city: payload.city } : {}),
      ...(payload.state ? { state: payload.state.toUpperCase() } : {}),
      updatedAt: new Date().toISOString()
    });

    return { team: teamSchema.parse(updated) };
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

    const token = createId();
    const invite = await app.repositories.invites.create({
      id: createId(),
      ...payload,
      status: "pending",
      invitedBy: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      createdAt: new Date().toISOString()
    });
    const invitedUser = await app.repositories.users.findByEmail(payload.email);

    if (invitedUser) {
      await new NotificationService(app.repositories).create({
        userId: invitedUser.id,
        type: "invite-created",
        title: "Novo convite de time",
        message: `Voce foi convidado para participar do time ${team.name}.`,
        metadata: { teamId: team.id, inviteId: invite.id }
      });
    }

    return { invite: inviteSchema.parse(invite) };
  });
};
