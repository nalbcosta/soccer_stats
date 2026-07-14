import type { FastifyPluginAsync } from "fastify";
import { approveMatchJoinRequestInputSchema, cancelMatchInputSchema, completeMatchInputSchema, createMatchInputSchema, listMatchesQuerySchema, matchJoinRequestSchema, matchPresenceSchema, matchSchema, reviewMatchInputSchema, updateMatchLineupInputSchema, updatePresenceInputSchema } from "@soccer-stats/shared";
import type { Match, MatchPresence, Team } from "@soccer-stats/shared";
import { matchRouteSchemas } from "../docs/openapi.js";
import { validateMatchEventLog, validateScoreAgainstGoalEvents } from "../lib/stats-service.js";
import { createId } from "../lib/ids.js";
import { NotificationService } from "../modules/notifications/notification.service.js";
import { canManageTeam, canOrganizeTeam, cleanEventLog, cleanVenue, teamMemberIds, venueToMatchSnapshot } from "../modules/matches/match.service.js";
import { AuditService } from "../modules/audit/audit.service.js";
import { StatsService } from "../modules/stats/stats.service.js";

const canReadMatch = (userId: string, teams: Team[]): boolean =>
  teams.some((team) => team.visibility === "public" || team.members.some((member) => member.userId === userId));

const normalizeSearch = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const degreesToRadians = (value: number): number => (value * Math.PI) / 180;

const distanceInKm = (from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }): number => {
  const earthRadiusKm = 6371;
  const latDelta = degreesToRadians(to.latitude - from.latitude);
  const lonDelta = degreesToRadians(to.longitude - from.longitude);
  const fromLat = degreesToRadians(from.latitude);
  const toLat = degreesToRadians(to.latitude);
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lonDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const upsertPresence = (presences: MatchPresence[], userId: string, status: MatchPresence["status"], updatedBy: string): MatchPresence[] => {
  const now = new Date().toISOString();
  const nextPresence: MatchPresence = { userId, status, updatedAt: now, updatedBy };
  const existing = presences.some((presence) => presence.userId === userId);
  return existing ? presences.map((presence) => (presence.userId === userId ? nextPresence : presence)) : [...presences, nextPresence];
};

export const matchRoutes: FastifyPluginAsync = async (app) => {
  app.get("/matches", { schema: matchRouteSchemas.list }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const query = listMatchesQuerySchema.parse(request.query);
    const userTeams = await app.repositories.teams.listByMember(user.id);
    const readableTeams = query.scope === "nearby" ? await app.repositories.teams.listVisibleToUser(user.id) : userTeams;
    const readableTeamIds = new Set(readableTeams.map((team) => team.id));
    const teamById = new Map(readableTeams.map((team) => [team.id, team]));
    const candidates = query.scope === "nearby"
      ? await app.repositories.matches.listByTeamIds([...readableTeamIds])
      : await app.repositories.matches.listByTeamIds(userTeams.map((team) => team.id));
    const search = query.q ? normalizeSearch(query.q) : null;
    const hasBrowserLocation = query.latitude !== undefined && query.longitude !== undefined;

    const filtered = candidates
      .filter((match) => readableTeamIds.has(match.home.teamId) || readableTeamIds.has(match.away.teamId))
      .filter((match) => !query.status || match.status === query.status)
      .filter((match) => !query.teamId || match.home.teamId === query.teamId || match.away.teamId === query.teamId)
      .filter((match) => !query.tournamentId || match.tournamentId === query.tournamentId)
      .filter((match) => {
        if (!search) {
          return true;
        }

        const homeTeam = teamById.get(match.home.teamId);
        const awayTeam = teamById.get(match.away.teamId);
        const haystack = [
          homeTeam?.name,
          awayTeam?.name,
          match.venue?.name,
          match.venue?.address,
          match.venue?.city,
          match.venue?.state
        ]
          .filter((value): value is string => Boolean(value))
          .map(normalizeSearch)
          .join(" ");

        return haystack.includes(search);
      })
      .filter((match) => {
        if (query.scope !== "nearby") {
          return true;
        }

        if (hasBrowserLocation && match.venue?.latitude !== undefined && match.venue.longitude !== undefined) {
          return distanceInKm(
            { latitude: query.latitude as number, longitude: query.longitude as number },
            { latitude: match.venue.latitude, longitude: match.venue.longitude }
          ) <= query.radiusKm;
        }

        if (query.city && match.venue?.city) {
          return normalizeSearch(match.venue.city) === normalizeSearch(query.city);
        }

        if (query.state && match.venue?.state) {
          return normalizeSearch(match.venue.state) === normalizeSearch(query.state);
        }

        return Boolean(match.venue?.city || match.venue?.state || match.venue?.latitude);
      })
      .sort((left, right) => new Date(left.playedAt).getTime() - new Date(right.playedAt).getTime());
    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const paged = filtered.slice(start, start + query.pageSize);

    return {
      matches: paged.map((match) => matchSchema.parse(match)),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize))
      }
    };
  });

  app.get("/matches/:matchId", { schema: matchRouteSchemas.get }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    const teams = await app.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);

    if (!canReadMatch(user.id, teams)) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    return { match: matchSchema.parse(match) };
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
    const venueRecord = payload.venueId ? await app.repositories.venues.findById(payload.venueId) : null;

    if (payload.venueId && !venueRecord) {
      reply.code(400);
      return { message: "Local informado nao foi encontrado." };
    }

    if (venueRecord && venueRecord.visibility !== "public" && venueRecord.ownerId !== user.id) {
      reply.code(403);
      return { message: "Sem permissao para usar este local." };
    }

    const venue = venueRecord ? venueToMatchSnapshot(venueRecord) : cleanVenue(payload.venue);
    const matchBase: Match = {
      id: createId(),
      type: payload.type,
      status: "scheduled",
      createdBy: user.id,
      participationPolicy: payload.participationPolicy,
      ...(payload.slotsPerSide ? { slotsPerSide: payload.slotsPerSide } : {}),
      home: payload.home,
      away: payload.away,
      eventLog: [],
      presences: [...new Set([...payload.home.playerIds, ...payload.away.playerIds])].map((playerId) => ({
        userId: playerId,
        status: "pending",
        updatedAt: now,
        updatedBy: user.id
      })),
      checkIns: [],
      reviewStatus: "none",
      eventLogVersion: 1,
      ...(payload.durationMinutes ? { durationMinutes: payload.durationMinutes } : {}),
      ...(venueRecord ? { venueId: venueRecord.id } : {}),
      ...(venue ? { venue } : {}),
      playedAt: payload.playedAt,
      createdAt: now,
      updatedAt: now
    };
    const match = await app.repositories.matches.create(
      payload.tournamentId ? { ...matchBase, tournamentId: payload.tournamentId } : matchBase
    );

    await new NotificationService(app.repositories).notifyUsers(teamMemberIds([homeTeam, awayTeam]), {
      type: "match-scheduled",
      metadata: { matchId: match.id, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id, homeTeam: homeTeam.name, awayTeam: awayTeam.name }
    });
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "match.create",
      resourceType: "match",
      resourceId: match.id,
      metadata: { homeTeamId: homeTeam.id, awayTeamId: awayTeam.id }
    });

    return { match: matchSchema.parse(match) };
  });

  app.post("/matches/:matchId/join-requests", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { matchId } = request.params as { matchId: string };
    const match = await app.repositories.matches.findById(matchId);
    if (!match || match.participationPolicy !== "request" || match.status === "completed" || match.status === "cancelled") { reply.code(404); return { message: "Esta partida nao aceita solicitacoes." }; }
    if ([...match.home.playerIds, ...match.away.playerIds].includes(user.id)) { reply.code(409); return { message: "Voce ja esta relacionado a esta partida." }; }
    if (await app.repositories.matchJoinRequests.findByMatchAndUser(matchId, user.id)) { reply.code(409); return { message: "Voce ja possui uma solicitacao pendente." }; }
    const requestItem = await app.repositories.matchJoinRequests.create({ id: createId(), matchId, userId: user.id, status: "pending", requestedAt: new Date().toISOString() });
    return { request: matchJoinRequestSchema.parse(requestItem) };
  });

  app.get("/matches/:matchId/join-requests", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { matchId } = request.params as { matchId: string };
    const match = await app.repositories.matches.findById(matchId);
    if (!match) { reply.code(404); return { message: "Partida nao encontrada." }; }
    const [home, away] = await Promise.all([app.repositories.teams.findById(match.home.teamId), app.repositories.teams.findById(match.away.teamId)]);
    if (!canOrganizeTeam(user.id, home) && !canOrganizeTeam(user.id, away)) { reply.code(403); return { message: "Sem permissao para ver solicitacoes." }; }
    return { requests: (await app.repositories.matchJoinRequests.listByMatch(matchId)).map((item) => matchJoinRequestSchema.parse(item)) };
  });

  for (const decision of ["approve", "reject"] as const) {
    app.post(`/matches/:matchId/join-requests/:requestId/${decision}`, async (request, reply) => {
      const user = await app.auth.requireUser(request, reply);
      if (!user) return;
      const { matchId, requestId } = request.params as { matchId: string; requestId: string };
      const match = await app.repositories.matches.findById(matchId);
      const joinRequest = await app.repositories.matchJoinRequests.findById(requestId);
      if (!match || !joinRequest || joinRequest.matchId !== matchId) { reply.code(404); return { message: "Solicitacao nao encontrada." }; }
      if (match.status === "completed" || match.status === "cancelled" || joinRequest.status !== "pending") { reply.code(409); return { message: "Esta solicitacao nao pode ser processada." }; }
      const [home, away] = await Promise.all([app.repositories.teams.findById(match.home.teamId), app.repositories.teams.findById(match.away.teamId)]);
      if (!canOrganizeTeam(user.id, home) && !canOrganizeTeam(user.id, away)) { reply.code(403); return { message: "Sem permissao para organizar esta partida." }; }
      const payload = decision === "approve" ? approveMatchJoinRequestInputSchema.parse(request.body) : undefined;
      const side = payload?.side;
      if (side && match.slotsPerSide && match[side].playerIds.length >= match.slotsPerSide) { reply.code(409); return { message: "Nao ha mais vagas neste lado." }; }
      const now = new Date().toISOString();
      if (side) await app.repositories.matches.update({ ...match, [side]: { ...match[side], playerIds: [...match[side].playerIds, joinRequest.userId] }, presences: upsertPresence(match.presences ?? [], joinRequest.userId, "pending", user.id), updatedAt: now });
      const updatedRequest = await app.repositories.matchJoinRequests.update({ ...joinRequest, status: decision === "approve" ? "approved" : "rejected", ...(side ? { side } : {}), reviewedAt: now, reviewedBy: user.id });
      await new AuditService(app.repositories).record({ actorUserId: user.id, action: `match.join-request.${decision}`, resourceType: "match", resourceId: matchId, metadata: { requestId, ...(side ? { side } : {}) } });
      return { request: matchJoinRequestSchema.parse(updatedRequest) };
    });
  }

  app.get("/matches/:matchId/presences", { schema: matchRouteSchemas.listPresences }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    const teams = await app.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);

    if (!canReadMatch(user.id, teams)) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    return { presences: (match.presences ?? []).map((presence) => matchPresenceSchema.parse(presence)) };
  });

  app.put("/matches/:matchId/presences/me", { schema: matchRouteSchemas.updateMyPresence }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const payload = updatePresenceInputSchema.parse(request.body);
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    if (![...match.home.playerIds, ...match.away.playerIds].includes(user.id)) {
      reply.code(403);
      return { message: "Voce nao esta relacionado a esta partida." };
    }

    const updated = await app.repositories.matches.update({
      ...match,
      status: match.status === "scheduled" ? "confirming" : match.status,
      presences: upsertPresence(match.presences ?? [], user.id, payload.status, user.id),
      updatedAt: new Date().toISOString()
    });
    await new StatsService(app.repositories).refreshPlayerCardProjection(user.id);

    await new NotificationService(app.repositories).notifyUsers([match.createdBy], {
      type: "presence-updated",
      metadata: { matchId: match.id, userId: user.id, status: payload.status }
    });

    return { presences: (updated.presences ?? []).map((presence) => matchPresenceSchema.parse(presence)) };
  });

  app.put("/matches/:matchId/presences/:userId", { schema: matchRouteSchemas.updatePresence }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId, userId } = request.params as { matchId: string; userId: string };
    const payload = updatePresenceInputSchema.parse(request.body);
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    const [homeTeam, awayTeam] = await Promise.all([
      app.repositories.teams.findById(match.home.teamId),
      app.repositories.teams.findById(match.away.teamId)
    ]);

    if (!canManageTeam(user.id, homeTeam) && !canManageTeam(user.id, awayTeam)) {
      reply.code(403);
      return { message: "Sem permissao para alterar presenca." };
    }

    if (![...match.home.playerIds, ...match.away.playerIds].includes(userId)) {
      reply.code(400);
      return { message: "Jogador nao relacionado a esta partida." };
    }

    const updated = await app.repositories.matches.update({
      ...match,
      status: match.status === "scheduled" ? "confirming" : match.status,
      presences: upsertPresence(match.presences ?? [], userId, payload.status, user.id),
      updatedAt: new Date().toISOString()
    });
    await new StatsService(app.repositories).refreshPlayerCardProjection(userId);

    await new NotificationService(app.repositories).create({
      userId,
      type: "presence-updated",
      metadata: { matchId: match.id, status: payload.status }
    });

    return { presences: (updated.presences ?? []).map((presence) => matchPresenceSchema.parse(presence)) };
  });

  app.post("/matches/:matchId/cancel", { schema: matchRouteSchemas.cancel }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const payload = cancelMatchInputSchema.parse(request.body);
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    if (match.status === "completed") {
      reply.code(409);
      return { message: "Partida concluida nao pode ser cancelada." };
    }

    const [homeTeam, awayTeam] = await Promise.all([
      app.repositories.teams.findById(match.home.teamId),
      app.repositories.teams.findById(match.away.teamId)
    ]);

    if (!canManageTeam(user.id, homeTeam) && !canManageTeam(user.id, awayTeam)) {
      reply.code(403);
      return { message: "Sem permissao para cancelar a partida." };
    }

    const cancelled = await app.repositories.matches.update({
      ...match,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelledBy: user.id,
      ...(payload.reason ? { cancelReason: payload.reason } : {}),
      updatedAt: new Date().toISOString()
    });

    const involvedTeams: Team[] = [homeTeam, awayTeam].filter((team): team is Team => Boolean(team));
    await new NotificationService(app.repositories).notifyUsers(teamMemberIds(involvedTeams), {
      type: "match-cancelled",
      metadata: { matchId: match.id }
    });

    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "match.cancel",
      resourceType: "match",
      resourceId: match.id
    });

    return { match: matchSchema.parse(cancelled) };
  });

  app.post("/matches/:matchId/lineup", { schema: matchRouteSchemas.updateLineup }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const payload = updateMatchLineupInputSchema.parse(request.body);
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    if (match.status === "completed" || match.status === "cancelled") {
      reply.code(409);
      return { message: "Escalacao so pode ser alterada antes do encerramento." };
    }

    const [homeTeam, awayTeam] = await Promise.all([
      app.repositories.teams.findById(match.home.teamId),
      app.repositories.teams.findById(match.away.teamId)
    ]);

    if (!canManageTeam(user.id, homeTeam) && !canManageTeam(user.id, awayTeam)) {
      reply.code(403);
      return { message: "Sem permissao para alterar escalacao." };
    }

    const invalidHomePlayers = payload.homePlayerIds.filter((playerId) => !match.home.playerIds.includes(playerId));
    const invalidAwayPlayers = payload.awayPlayerIds.filter((playerId) => !match.away.playerIds.includes(playerId));

    if (invalidHomePlayers.length > 0 || invalidAwayPlayers.length > 0) {
      reply.code(400);
      return { message: "Escalacao precisa usar jogadores relacionados a partida." };
    }

    const updated = await app.repositories.matches.update({
      ...match,
      lineup: {
        ...payload,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
      },
      updatedAt: new Date().toISOString()
    });
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "match.lineup",
      resourceType: "match",
      resourceId: match.id
    });

    return { match: matchSchema.parse(updated) };
  });

  app.post("/matches/:matchId/check-in/me", { schema: matchRouteSchemas.checkInMe }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    if (![...match.home.playerIds, ...match.away.playerIds].includes(user.id)) {
      reply.code(403);
      return { message: "Voce nao esta relacionado a esta partida." };
    }

    const existingCheckIns = match.checkIns ?? [];
    const checkIns = existingCheckIns.some((checkIn) => checkIn.userId === user.id)
      ? existingCheckIns
      : [...existingCheckIns, { userId: user.id, checkedInAt: new Date().toISOString() }];
    const updated = await app.repositories.matches.update({
      ...match,
      checkIns,
      updatedAt: new Date().toISOString()
    });
    await new StatsService(app.repositories).refreshPlayerCardProjection(user.id);

    return { match: matchSchema.parse(updated) };
  });

  app.post("/matches/:matchId/review", { schema: matchRouteSchemas.review }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const payload = reviewMatchInputSchema.parse(request.body);
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    if (match.status !== "completed") {
      reply.code(409);
      return { message: "Apenas partidas concluidas podem ser revisadas." };
    }

    const [homeTeam, awayTeam] = await Promise.all([
      app.repositories.teams.findById(match.home.teamId),
      app.repositories.teams.findById(match.away.teamId)
    ]);

    if (!canManageTeam(user.id, homeTeam) && !canManageTeam(user.id, awayTeam)) {
      reply.code(403);
      return { message: "Sem permissao para revisar a partida." };
    }

    const eventLog = cleanEventLog(payload.eventLog);
    const eventError = validateMatchEventLog(match, eventLog, payload.durationMinutes ?? match.durationMinutes);

    if (eventError) {
      reply.code(400);
      return { message: eventError };
    }

    const scoreError = validateScoreAgainstGoalEvents(match.home.teamId, match.away.teamId, payload.homeScore, payload.awayScore, eventLog);

    if (scoreError) {
      reply.code(400);
      return { message: scoreError };
    }

    const venue = cleanVenue(payload.venue);
    const updated = await app.repositories.matches.update({
      ...match,
      home: { ...match.home, score: payload.homeScore },
      away: { ...match.away, score: payload.awayScore },
      eventLog,
      eventLogVersion: (match.eventLogVersion ?? 1) + 1,
      reviewStatus: "pending",
      ...(payload.durationMinutes ? { durationMinutes: payload.durationMinutes } : {}),
      ...(venue ? { venue } : {}),
      updatedAt: new Date().toISOString()
    });
    await new StatsService(app.repositories).recalculateAfterMatch(updated);
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "match.review",
      resourceType: "match",
      resourceId: match.id,
      metadata: { eventLogVersion: String(updated.eventLogVersion), reason: payload.reason ?? "" }
    });

    return { match: matchSchema.parse(updated) };
  });

  app.post("/matches/:matchId/review/approve", { schema: matchRouteSchemas.approveReview }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    const [homeTeam, awayTeam] = await Promise.all([
      app.repositories.teams.findById(match.home.teamId),
      app.repositories.teams.findById(match.away.teamId)
    ]);

    if (!canManageTeam(user.id, homeTeam) && !canManageTeam(user.id, awayTeam)) {
      reply.code(403);
      return { message: "Sem permissao para aprovar revisao." };
    }

    const updated = await app.repositories.matches.update({ ...match, reviewStatus: "approved", updatedAt: new Date().toISOString() });
    return { match: matchSchema.parse(updated) };
  });

  app.post("/matches/:matchId/review/dispute", { schema: matchRouteSchemas.disputeReview }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    const teams = await app.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);

    if (!canReadMatch(user.id, teams)) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    const updated = await app.repositories.matches.update({ ...match, reviewStatus: "disputed", updatedAt: new Date().toISOString() });
    return { match: matchSchema.parse(updated) };
  });

  app.get("/matches/:matchId/stats-impact", { schema: matchRouteSchemas.statsImpact }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { matchId } = request.params as { matchId: string };
    const match = await app.repositories.matches.findById(matchId);

    if (!match) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    const teams = await app.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);

    if (!canReadMatch(user.id, teams)) {
      reply.code(404);
      return { message: "Partida nao encontrada." };
    }

    return { impact: new StatsService(app.repositories).buildStatsImpact(match) };
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

    if (match.status === "completed") {
      reply.code(409);
      return { message: "Esta partida ja foi encerrada." };
    }

    if (match.status === "cancelled") {
      reply.code(409);
      return { message: "Partida cancelada nao pode ser encerrada." };
    }

    const [homeTeam, awayTeam] = await Promise.all([
      app.repositories.teams.findById(match.home.teamId),
      app.repositories.teams.findById(match.away.teamId)
    ]);

    if (!canManageTeam(user.id, homeTeam) || !canManageTeam(user.id, awayTeam)) {
      reply.code(403);
      return { message: "Sem permissao para encerrar a partida." };
    }

    const eventLog = cleanEventLog(payload.eventLog);
    const eventError = validateMatchEventLog(match, eventLog, payload.durationMinutes ?? match.durationMinutes);

    if (eventError) {
      reply.code(400);
      return { message: eventError };
    }

    const scoreError = validateScoreAgainstGoalEvents(
      match.home.teamId,
      match.away.teamId,
      payload.homeScore,
      payload.awayScore,
      eventLog
    );

    if (scoreError) {
      reply.code(400);
      return { message: scoreError };
    }

    const venue = cleanVenue(payload.venue);
    const completed = await app.repositories.matches.update({
      ...match,
      status: "completed",
      home: { ...match.home, score: payload.homeScore },
      away: { ...match.away, score: payload.awayScore },
      eventLog,
      reviewStatus: "none",
      eventLogVersion: match.eventLogVersion ?? 1,
      ...(payload.durationMinutes ? { durationMinutes: payload.durationMinutes } : {}),
      ...(venue ? { venue } : {}),
      updatedAt: new Date().toISOString()
    });

    const involvedTeams: Team[] = [homeTeam, awayTeam].filter((team): team is Team => Boolean(team));
    await new StatsService(app.repositories).recalculateAfterMatch(completed);

    if (completed.tournamentId) {
      const tournament = await app.repositories.tournaments.findById(completed.tournamentId);

      if (tournament) {
        const teams = await app.repositories.teams.listByIds(tournament.teamIds);
        await new NotificationService(app.repositories).notifyUsers(teamMemberIds(teams), {
          type: "tournament-updated",
          metadata: { tournamentId: tournament.id, matchId: completed.id, tournamentName: tournament.name }
        });
      }
    }

    await new NotificationService(app.repositories).notifyUsers(teamMemberIds(involvedTeams), {
      type: "match-completed",
      metadata: { matchId: completed.id, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id, homeTeam: homeTeam.name, awayTeam: awayTeam.name, homeScore: String(payload.homeScore), awayScore: String(payload.awayScore) }
    });
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "match.complete",
      resourceType: "match",
      resourceId: completed.id
    });

    return { match: matchSchema.parse(completed) };
  });
};
