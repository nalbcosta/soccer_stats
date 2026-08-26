import type { FastifyPluginAsync } from "fastify";
import { extname } from "node:path";
import { athleteSkillsInputSchema, createEmptyStats, createInviteInputSchema, createTeamInputSchema, inviteSchema, listTeamsQuerySchema, teamAthleteSchema, teamAthleteSkillChangeRequestSchema, teamAthleteSkillOverrideSchema, teamJoinRequestSchema, teamSchema, updateMembershipRoleInputSchema, updateTeamInputSchema } from "@soccer-stats/shared";
import { teamRouteSchemas } from "../docs/openapi.js";
import { createId, slugify } from "../lib/ids.js";
import { removeStoredImage, storePublicImage } from "../lib/image-storage.js";
import { NotificationService } from "../modules/notifications/notification.service.js";
import { AuditService } from "../modules/audit/audit.service.js";

const ensureTeamPermission = (teamId: string, userId: string, app: Parameters<FastifyPluginAsync>[0]) =>
  app.repositories.teams.findById(teamId).then((team) => {
    if (!team) {
      return null;
    }

    return team.members.some((member) => member.userId === userId && (member.role === "owner" || member.role === "admin"))
      ? team
      : undefined;
  });

const isOrganizer = (role?: string) => role === "owner" || role === "admin" || role === "captain";

const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const issueTeamSlug = async (name: string, app: Parameters<FastifyPluginAsync>[0]) => {
  const baseSlug = slugify(name) || "time";
  let slug = baseSlug;
  let suffix = 2;
  while (await app.repositories.teams.findBySlug(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return slug;
};
const degreesToRadians = (value: number) => (value * Math.PI) / 180;
const distanceInKm = (from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) => {
  const latitude = degreesToRadians(to.latitude - from.latitude);
  const longitude = degreesToRadians(to.longitude - from.longitude);
  const a = Math.sin(latitude / 2) ** 2 + Math.cos(degreesToRadians(from.latitude)) * Math.cos(degreesToRadians(to.latitude)) * Math.sin(longitude / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const allowedLogoMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const resolveLogoExtension = (filename: string, mimeType: string): ".jpg" | ".png" | ".webp" | null => {
  const extension = extname(filename).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return ".jpg";
  if (extension === ".png") return ".png";
  if (extension === ".webp") return ".webp";
  return mimeType === "image/jpeg" ? ".jpg" : mimeType === "image/png" ? ".png" : mimeType === "image/webp" ? ".webp" : null;
};
const detectImageMimeType = (buffer: Buffer): "image/jpeg" | "image/png" | "image/webp" | null => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
};
export const teamRoutes: FastifyPluginAsync = async (app) => {
  app.get("/teams", { schema: teamRouteSchemas.list }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const query = listTeamsQuerySchema.parse(request.query);
    const teams = query.scope === "mine" ? await app.repositories.teams.listByMember(user.id) : await app.repositories.teams.listVisibleToUser(user.id);
    const search = query.q ? normalizeSearch(query.q) : undefined;
    const filtered = teams
      .filter((team) => query.scope === "mine" || (team.visibility === "public" && team.joinPolicy === "request"))
      .filter((team) => !search || [team.name, team.city, team.state, team.description].filter((value): value is string => Boolean(value)).map(normalizeSearch).join(" ").includes(search))
      .filter((team) => !query.city || normalizeSearch(team.city ?? "") === normalizeSearch(query.city))
      .filter((team) => !query.state || (team.state ?? "").toLowerCase() === query.state.toLowerCase())
      .filter((team) => {
        if (query.latitude === undefined || query.longitude === undefined || team.latitude === undefined || team.longitude === undefined) return true;
        return distanceInKm({ latitude: query.latitude, longitude: query.longitude }, { latitude: team.latitude, longitude: team.longitude }) <= query.radiusKm;
      });
    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    return { teams: filtered.slice(start, start + query.pageSize).map((team) => teamSchema.parse(team)), pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) } };
  });

  app.get("/teams/:teamId", { schema: teamRouteSchemas.get }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { teamId } = request.params as { teamId: string };
    const team = await app.repositories.teams.findById(teamId) ?? await app.repositories.teams.findBySlug(teamId);

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
      slug: await issueTeamSlug(payload.name, app),
      ownerId: user.id,
      visibility: payload.visibility,
      joinPolicy: payload.joinPolicy,
      ...(payload.description ? { description: payload.description } : {}),
      ...(payload.whatsappGroupUrl ? { whatsappGroupUrl: payload.whatsappGroupUrl } : {}),
      ...(payload.city ? { city: payload.city } : {}),
      ...(payload.state ? { state: payload.state.toUpperCase() } : {}),
      ...(payload.latitude !== undefined ? { latitude: payload.latitude } : {}),
      ...(payload.longitude !== undefined ? { longitude: payload.longitude } : {}),
      members: [{ userId: user.id, username: user.username, role: "owner", joinedAt: now }],
      stats: createEmptyStats(),
      createdAt: now,
      updatedAt: now
    });
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "team.create",
      resourceType: "team",
      resourceId: team.id
    });

    return { team: teamSchema.parse(team) };
  });

  app.patch("/teams/:teamId", { schema: teamRouteSchemas.update }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { teamId } = request.params as { teamId: string };
    const payload = updateTeamInputSchema.parse(request.body);
    const team = await ensureTeamPermission(teamId, user.id, app);

    if (!team) {
      reply.code(403);
      return { message: "Sem permissao para editar este time." };
    }

    const updatedTeam = {
      ...team,
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.visibility ? { visibility: payload.visibility } : {}),
      ...(payload.joinPolicy ? { joinPolicy: payload.joinPolicy } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.city ? { city: payload.city } : {}),
      ...(payload.state ? { state: payload.state.toUpperCase() } : {}),
      ...(payload.latitude !== undefined ? { latitude: payload.latitude } : {}),
      ...(payload.longitude !== undefined ? { longitude: payload.longitude } : {}),
      updatedAt: new Date().toISOString()
    };
    if (payload.whatsappGroupUrl === null) delete updatedTeam.whatsappGroupUrl;
    else if (payload.whatsappGroupUrl !== undefined) updatedTeam.whatsappGroupUrl = payload.whatsappGroupUrl;
    const updated = await app.repositories.teams.update(updatedTeam);
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "team.update",
      resourceType: "team",
      resourceId: updated.id
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

    const invitedUser = await app.repositories.users.findByPublicIdentifier(payload.publicIdentifier);
    if (!invitedUser) {
      reply.code(404);
      return { message: "Jogador nao encontrado com esse identificador." };
    }
    if (team.members.some((member) => member.userId === invitedUser.id)) {
      reply.code(409);
      return { message: "Esse jogador ja faz parte do time." };
    }
    const existingInvite = (await app.repositories.invites.listByResource("team", team.id)).find(
      (item) => item.status === "pending" && item.recipientUserId === invitedUser.id
    );
    if (existingInvite) {
      reply.code(409);
      return { message: "Esse jogador ja possui um convite pendente." };
    }

    const token = createId();
    const invite = await app.repositories.invites.create({
      id: createId(),
      resourceType: payload.resourceType,
      resourceId: payload.resourceId,
      recipientUserId: invitedUser.id,
      recipientPublicIdentifier: invitedUser.publicIdentifier,
      role: payload.role,
      status: "pending",
      invitedBy: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      createdAt: new Date().toISOString()
    });
    await new NotificationService(app.repositories).create({
      userId: invitedUser.id,
      type: "invite-created",
      metadata: { teamId: team.id, inviteId: invite.id, teamName: team.name }
    });
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "team.invite",
      resourceType: "invite",
      resourceId: invite.id,
      metadata: { teamId: team.id }
    });

    return { invite: inviteSchema.parse(invite) };
  });

  app.post("/teams/:teamId/logo", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId } = request.params as { teamId: string };
    const team = await ensureTeamPermission(teamId, user.id, app);
    if (!team) { reply.code(403); return { message: "Sem permissao para alterar o logo." }; }
    const part = await request.file();
    if (!part) { reply.code(400); return { message: "Arquivo de logo nao enviado." }; }
    const extension = resolveLogoExtension(part.filename, part.mimetype);
    const buffer = await part.toBuffer();
    const detectedMimeType = detectImageMimeType(buffer);
    if (!extension || !allowedLogoMimeTypes.has(part.mimetype) || detectedMimeType !== part.mimetype) { reply.code(400); return { message: "Envie uma imagem JPG, PNG ou WebP valida." }; }
    const fileName = `team-${team.id}-${createId()}${extension}`;
    const storedImage = await storePublicImage({ fileName, folder: "teams", buffer, contentType: detectedMimeType });
    const updated = await app.repositories.teams.update({ ...team, logoUrl: storedImage.url, logoMetadata: { fileName, mimeType: detectedMimeType, size: buffer.length, uploadedAt: new Date().toISOString() }, updatedAt: new Date().toISOString() });
    await removeStoredImage(team.logoUrl);
    return { team: teamSchema.parse(updated) };
  });

  app.delete("/teams/:teamId/logo", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId } = request.params as { teamId: string };
    const team = await ensureTeamPermission(teamId, user.id, app);
    if (!team) { reply.code(403); return { message: "Sem permissao para alterar o logo." }; }
    const { logoUrl: _logoUrl, logoMetadata: _logoMetadata, ...teamWithoutLogo } = team;
    const updated = await app.repositories.teams.update({ ...teamWithoutLogo, updatedAt: new Date().toISOString() });
    await removeStoredImage(team.logoUrl);
    return { team: teamSchema.parse(updated) };
  });

  app.post("/teams/:teamId/join-requests", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId } = request.params as { teamId: string };
    const team = await app.repositories.teams.findById(teamId);
    if (!team || team.visibility !== "public" || team.joinPolicy !== "request") { reply.code(404); return { message: "Este time nao aceita solicitacoes." }; }
    if (team.members.some((member) => member.userId === user.id)) { reply.code(409); return { message: "Voce ja faz parte deste time." }; }
    if (await app.repositories.teamJoinRequests.findByTeamAndUser(teamId, user.id)) { reply.code(409); return { message: "Voce ja possui uma solicitacao pendente." }; }
    const requestItem = await app.repositories.teamJoinRequests.create({ id: createId(), teamId, userId: user.id, status: "pending", requestedAt: new Date().toISOString() });
    await new AuditService(app.repositories).record({ actorUserId: user.id, action: "team.join-request.create", resourceType: "team", resourceId: teamId });
    return { request: teamJoinRequestSchema.parse(requestItem) };
  });

  app.get("/teams/:teamId/join-requests", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId } = request.params as { teamId: string };
    if (!await ensureTeamPermission(teamId, user.id, app)) { reply.code(403); return { message: "Sem permissao para ver solicitacoes." }; }
    return { requests: (await app.repositories.teamJoinRequests.listByTeam(teamId)).map((item) => teamJoinRequestSchema.parse(item)) };
  });

  for (const decision of ["approve", "reject"] as const) {
    app.post(`/teams/:teamId/join-requests/:requestId/${decision}`, async (request, reply) => {
      const user = await app.auth.requireUser(request, reply);
      if (!user) return;
      const { teamId, requestId } = request.params as { teamId: string; requestId: string };
      const team = await ensureTeamPermission(teamId, user.id, app);
      const joinRequest = await app.repositories.teamJoinRequests.findById(requestId);
      if (!team || !joinRequest || joinRequest.teamId !== teamId) { reply.code(404); return { message: "Solicitacao nao encontrada." }; }
      if (joinRequest.status !== "pending") { reply.code(409); return { message: "Esta solicitacao ja foi processada." }; }
      const now = new Date().toISOString();
      const shouldAddMember = decision === "approve" && !team.members.some((member) => member.userId === joinRequest.userId);
      const joiningUser = shouldAddMember ? await app.repositories.users.findById(joinRequest.userId) : null;
      if (shouldAddMember && !joiningUser) { reply.code(404); return { message: "Usuario solicitante nao encontrado." }; }
      const updatedRequest = await app.repositories.teamJoinRequests.update({ ...joinRequest, status: decision === "approve" ? "approved" : "rejected", reviewedAt: now, reviewedBy: user.id });
      if (shouldAddMember && joiningUser) {
        await app.repositories.teams.update({ ...team, members: [...team.members, { userId: joinRequest.userId, username: joiningUser.username, role: "member", joinedAt: now }], updatedAt: now });
      }
      await new AuditService(app.repositories).record({ actorUserId: user.id, action: `team.join-request.${decision}`, resourceType: "team", resourceId: teamId, metadata: { requestId } });
      return { request: teamJoinRequestSchema.parse(updatedRequest) };
    });
  }

  app.patch("/teams/:teamId/members/:userId/role", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId, userId } = request.params as { teamId: string; userId: string };
    const team = await ensureTeamPermission(teamId, user.id, app);
    if (!team) { reply.code(403); return { message: "Sem permissao para alterar papeis." }; }
    if (userId === team.ownerId) { reply.code(409); return { message: "O papel do owner nao pode ser alterado." }; }
    const payload = updateMembershipRoleInputSchema.parse(request.body);
    if (!team.members.some((member) => member.userId === userId)) { reply.code(404); return { message: "Membro nao encontrado." }; }
    const updated = await app.repositories.teams.update({ ...team, members: team.members.map((member) => member.userId === userId ? { ...member, role: payload.role } : member), updatedAt: new Date().toISOString() });
    return { team: teamSchema.parse(updated) };
  });

  app.get("/teams/:teamId/athletes", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId } = request.params as { teamId: string };
    const team = await app.repositories.teams.findById(teamId);
    const requestingMembership = team?.members.find((member) => member.userId === user.id);
    if (!team || !requestingMembership) { reply.code(404); return { message: "Time nao encontrado." }; }
    const userIds = team.members.map((member) => member.userId);
    const [profiles, overrides, changeRequests] = await Promise.all([
      app.repositories.playerProfiles.listByUserIds(userIds),
      app.repositories.teamAthleteSkillOverrides.listByTeam(team.id),
      app.repositories.teamAthleteSkillChangeRequests.listByTeam(team.id)
    ]);
    const profileByUser = new Map(profiles.map((profile) => [profile.userId, profile]));
    const overrideByUser = new Map(overrides.map((item) => [item.userId, item]));
    const changeRequestByUser = new Map(changeRequests.map((item) => [item.userId, item]));
    const organizer = isOrganizer(requestingMembership.role);
    const athletes = team.members.map((member) => {
      const override = overrideByUser.get(member.userId);
      const changeRequest = organizer || member.userId === user.id ? changeRequestByUser.get(member.userId) : undefined;
      const effectiveSkills = override ? {
        userId: member.userId, outfield: override.outfield, isGoalkeeper: override.isGoalkeeper,
        ...(override.goalkeeper ? { goalkeeper: override.goalkeeper } : {}),
        completedAt: override.updatedAt, updatedAt: override.updatedAt
      } : undefined;
      return teamAthleteSchema.parse({
        userId: member.userId,
        ...(member.username ? { username: member.username } : {}),
        displayName: profileByUser.get(member.userId)?.displayName ?? member.username ?? "Jogador",
        role: member.role,
        ...(effectiveSkills ? { effectiveSkills } : {}),
        ...(override ? { skillOverride: teamAthleteSkillOverrideSchema.parse(override) } : {}),
        ...(override ? { skillOverrideByName: team.members.find((item) => item.userId === override.updatedBy)?.username ?? "Organizador" } : {}),
        ...(changeRequest ? { skillChangeRequest: teamAthleteSkillChangeRequestSchema.parse(changeRequest) } : {}),
        hasSkillOverride: Boolean(override)
      });
    });
    return { athletes, canOrganize: organizer };
  });

  app.put("/teams/:teamId/athletes/:userId/skill-override", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId, userId } = request.params as { teamId: string; userId: string };
    const team = await app.repositories.teams.findById(teamId);
    const membership = team?.members.find((member) => member.userId === user.id);
    if (!team || !membership || (!isOrganizer(membership.role) && user.id !== userId)) { reply.code(403); return { message: "Sem permissao para avaliar este atleta." }; }
    if (!team.members.some((member) => member.userId === userId)) { reply.code(404); return { message: "Atleta nao encontrado no time." }; }
    const payload = athleteSkillsInputSchema.parse(request.body);
    const current = await app.repositories.teamAthleteSkillOverrides.findByTeamAndUser(teamId, userId);
    const isSelfService = !isOrganizer(membership.role) && user.id === userId;
    const now = new Date().toISOString();
    if (isSelfService && current) {
      const existingRequest = await app.repositories.teamAthleteSkillChangeRequests.findByTeamAndUser(teamId, userId);
      const requestedChange = await app.repositories.teamAthleteSkillChangeRequests.upsert({
        id: existingRequest?.id ?? createId(), teamId, userId, outfield: payload.outfield, isGoalkeeper: payload.isGoalkeeper,
        ...(payload.goalkeeper ? { goalkeeper: payload.goalkeeper } : {}), status: "pending", requestedAt: now
      });
      await new AuditService(app.repositories).record({ actorUserId: user.id, action: "team.athlete-skills.request", resourceType: "team", resourceId: teamId, metadata: { athleteUserId: userId } });
      return { skillChangeRequest: teamAthleteSkillChangeRequestSchema.parse(requestedChange) };
    }
    const value = await app.repositories.teamAthleteSkillOverrides.upsert({
      id: current?.id ?? createId(), teamId, userId, outfield: payload.outfield, isGoalkeeper: payload.isGoalkeeper,
      ...(payload.goalkeeper ? { goalkeeper: payload.goalkeeper } : {}), updatedBy: user.id, updatedAt: now
    });
    await new AuditService(app.repositories).record({ actorUserId: user.id, action: current ? "team.athlete-skills.update" : "team.athlete-skills.initial-assessment", resourceType: "team", resourceId: teamId, metadata: { athleteUserId: userId } });
    return { skillOverride: teamAthleteSkillOverrideSchema.parse(value) };
  });

  for (const decision of ["approve", "reject"] as const) {
    app.post(`/teams/:teamId/athletes/:userId/skill-change-requests/:requestId/${decision}`, async (request, reply) => {
      const user = await app.auth.requireUser(request, reply);
      if (!user) return;
      const { teamId, userId, requestId } = request.params as { teamId: string; userId: string; requestId: string };
      const team = await app.repositories.teams.findById(teamId);
      const membership = team?.members.find((member) => member.userId === user.id);
      if (!team || !membership || !isOrganizer(membership.role)) { reply.code(403); return { message: "Sem permissao para analisar esta solicitacao." }; }
      const requestedChange = await app.repositories.teamAthleteSkillChangeRequests.findByTeamAndUser(teamId, userId);
      if (!requestedChange || requestedChange.id !== requestId) { reply.code(404); return { message: "Solicitacao de alteracao nao encontrada." }; }
      if (requestedChange.status !== "pending") { reply.code(409); return { message: "Esta solicitacao ja foi analisada." }; }
      const now = new Date().toISOString();
      const reviewedRequest = await app.repositories.teamAthleteSkillChangeRequests.upsert({ ...requestedChange, status: decision === "approve" ? "approved" : "rejected", reviewedAt: now, reviewedBy: user.id });
      if (decision === "approve") {
        const current = await app.repositories.teamAthleteSkillOverrides.findByTeamAndUser(teamId, userId);
        await app.repositories.teamAthleteSkillOverrides.upsert({
          id: current?.id ?? createId(), teamId, userId, outfield: requestedChange.outfield, isGoalkeeper: requestedChange.isGoalkeeper,
          ...(requestedChange.goalkeeper ? { goalkeeper: requestedChange.goalkeeper } : {}), updatedBy: user.id, updatedAt: now
        });
      }
      await new AuditService(app.repositories).record({ actorUserId: user.id, action: `team.athlete-skills.request.${decision}`, resourceType: "team", resourceId: teamId, metadata: { athleteUserId: userId, requestId } });
      return { request: teamAthleteSkillChangeRequestSchema.parse(reviewedRequest) };
    });
  }

};
