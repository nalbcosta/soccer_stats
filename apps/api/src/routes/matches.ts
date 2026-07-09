import type { FastifyPluginAsync } from "fastify";
import { cancelMatchInputSchema, completeMatchInputSchema, createMatchInputSchema, matchPresenceSchema, matchSchema, reviewMatchInputSchema, updateMatchLineupInputSchema, updatePresenceInputSchema } from "@soccer-stats/shared";
import type { Match, MatchPresence, Team } from "@soccer-stats/shared";
import { matchRouteSchemas } from "../docs/openapi.js";
import { validateMatchEventLog, validateScoreAgainstGoalEvents } from "../lib/stats-service.js";
import { createId } from "../lib/ids.js";
import { NotificationService } from "../modules/notifications/notification.service.js";
import { canManageTeam, cleanEventLog, cleanVenue, teamMemberIds, venueToMatchSnapshot } from "../modules/matches/match.service.js";
import { AuditService } from "../modules/audit/audit.service.js";
import { StatsService } from "../modules/stats/stats.service.js";

const canReadMatch = (userId: string, teams: Team[]): boolean =>
  teams.some((team) => team.visibility === "public" || team.members.some((member) => member.userId === userId));

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

    const teams = await app.repositories.teams.listByMember(user.id);
    const matches = await app.repositories.matches.listByTeamIds(teams.map((team) => team.id));
    return { matches: matches.map((match) => matchSchema.parse(match)) };
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
      title: "Partida marcada",
      message: `${homeTeam.name} x ${awayTeam.name} foi marcada no NaBola.`,
      metadata: { matchId: match.id, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id }
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

    await new NotificationService(app.repositories).notifyUsers([match.createdBy], {
      type: "presence-updated",
      title: "Presenca atualizada",
      message: "Um jogador atualizou a presenca na partida.",
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

    await new NotificationService(app.repositories).create({
      userId,
      type: "presence-updated",
      title: "Sua presenca foi atualizada",
      message: "Um admin atualizou sua presenca na partida.",
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
      title: "Partida cancelada",
      message: "Uma partida foi cancelada no NaBola.",
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
          title: "Tabela atualizada",
          message: `A tabela do campeonato ${tournament.name} foi atualizada.`,
          metadata: { tournamentId: tournament.id, matchId: completed.id }
        });
      }
    }

    await new NotificationService(app.repositories).notifyUsers(teamMemberIds(involvedTeams), {
      type: "match-completed",
      title: "Partida encerrada",
      message: `${homeTeam.name} ${payload.homeScore} x ${payload.awayScore} ${awayTeam.name}.`,
      metadata: { matchId: completed.id, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id }
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
