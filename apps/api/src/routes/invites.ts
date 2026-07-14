import type { FastifyPluginAsync } from "fastify";
import { inviteSchema } from "@soccer-stats/shared";
import { inviteRouteSchemas } from "../docs/openapi.js";
import { NotificationService } from "../modules/notifications/notification.service.js";
import { AuditService } from "../modules/audit/audit.service.js";

const adminMemberIds = (members: Array<{ userId: string; role: string }>) =>
  members.filter((member) => member.role === "owner" || member.role === "admin").map((member) => member.userId);

export const inviteRoutes: FastifyPluginAsync = async (app) => {
  app.get("/invites", { schema: inviteRouteSchemas.list }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const invites = await app.repositories.invites.findPendingByEmail(user.email);
    return { invites: invites.map((invite) => inviteSchema.parse(invite)) };
  });

  app.post("/invites/:token/accept", { schema: inviteRouteSchemas.accept }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { token } = request.params as { token: string };
    const invite = await app.repositories.invites.findByToken(token);

    if (!invite || invite.status !== "pending" || invite.email !== user.email) {
      reply.code(404);
      return { message: "Convite nao encontrado." };
    }

    if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
      reply.code(400);
      return { message: "Convite expirado." };
    }

    if (invite.resourceType !== "team") {
      reply.code(400);
      return { message: "Aceite de campeonato ainda nao esta disponivel." };
    }

    const team = await app.repositories.teams.findById(invite.resourceId);

    if (!team) {
      reply.code(404);
      return { message: "Time nao encontrado." };
    }

    const now = new Date().toISOString();
    const alreadyMember = team.members.some((member) => member.userId === user.id);
    const updatedTeam = alreadyMember
      ? team
      : await app.repositories.teams.update({
          ...team,
          members: [...team.members, { userId: user.id, role: invite.role, joinedAt: now }],
          updatedAt: now
        });
    const updatedInvite = await app.repositories.invites.update({ ...invite, status: "accepted" });

    await new NotificationService(app.repositories).notifyUsers(adminMemberIds(updatedTeam.members), {
      type: "invite-accepted",
      metadata: { teamId: updatedTeam.id, inviteId: invite.id, userId: user.id, teamName: updatedTeam.name, username: user.username }
    });
    await new NotificationService(app.repositories).create({
      userId: user.id,
      type: "team-member-added",
      metadata: { teamId: updatedTeam.id, inviteId: invite.id, teamName: updatedTeam.name }
    });
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "invite.accept",
      resourceType: "invite",
      resourceId: invite.id,
      metadata: { teamId: updatedTeam.id }
    });

    return { invite: inviteSchema.parse(updatedInvite), team: updatedTeam };
  });

  app.post("/invites/:inviteId/revoke", { schema: inviteRouteSchemas.revoke }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { inviteId } = request.params as { inviteId: string };
    const invite = await app.repositories.invites.findById(inviteId);

    if (!invite || invite.status !== "pending") {
      reply.code(404);
      return { message: "Convite nao encontrado." };
    }

    const team = invite.resourceType === "team" ? await app.repositories.teams.findById(invite.resourceId) : null;
    const canRevoke =
      invite.invitedBy === user.id ||
      Boolean(team?.members.some((member) => member.userId === user.id && (member.role === "owner" || member.role === "admin")));

    if (!canRevoke) {
      reply.code(403);
      return { message: "Sem permissao para revogar convite." };
    }

    const revoked = await app.repositories.invites.update({ ...invite, status: "revoked" });
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "invite.revoke",
      resourceType: "invite",
      resourceId: invite.id
    });

    return { invite: inviteSchema.parse(revoked) };
  });
};
