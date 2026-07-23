import type { FastifyPluginAsync } from "fastify";
import { buildPlayerCardProjection, buildPlayerCardRatings } from "@soccer-stats/shared";
import { playerRankingEntrySchema, playerRankingQuerySchema } from "@soccer-stats/shared";
import type { Match, PlayerRankingEntry, Team } from "@soccer-stats/shared";
import { rankingRouteSchemas } from "../docs/openapi.js";
import { calculatePlayerStats } from "../lib/stats-service.js";

const canReadTeam = (userId: string, team: Team | null): team is Team =>
  Boolean(team && (team.visibility === "public" || team.members.some((member) => member.userId === userId)));

const presenceRateFor = (playerId: string, matches: Match[]): number => {
  const presences = matches.flatMap((match) => match.presences ?? []).filter((presence) => presence.userId === playerId);

  if (presences.length === 0) {
    return 0;
  }

  const confirmed = presences.filter((presence) => presence.status === "confirmed").length;
  return Number(((confirmed / presences.length) * 100).toFixed(1));
};

const buildRanking = async (
  app: Parameters<FastifyPluginAsync>[0],
  matches: Match[],
  metric: "overall" | "goals" | "assists" | "presence" | "winning" | "form"
): Promise<PlayerRankingEntry[]> => {
  const completedMatches = matches.filter((match) => match.status === "completed");
  const playerIds = [...new Set(completedMatches.flatMap((match) => [...match.home.playerIds, ...match.away.playerIds]))];
  const profiles = await app.repositories.playerProfiles.listByUserIds(playerIds);
  const entries = profiles.map((profile) => {
    const stats = calculatePlayerStats(profile.userId, completedMatches);
    const presenceRate = presenceRateFor(profile.userId, matches);
    const checkInRate = matches.length === 0 ? 0 : Number(((matches.filter((match) => (match.checkIns ?? []).some((checkIn) => checkIn.userId === profile.userId)).length / matches.length) * 100).toFixed(1));
    const impactScore = completedMatches.reduce((total, match) => {
      const goals = match.eventLog.filter((event) => event.type === "goal" && event.playerId === profile.userId).length;
      const assists = match.eventLog.filter((event) => event.assistPlayerId === profile.userId).length;
      const checkedIn = (match.checkIns ?? []).some((checkIn) => checkIn.userId === profile.userId);
      return total + goals * 3 + assists * 2 + (checkedIn ? 1 : 0);
    }, 0);
    const projection = buildPlayerCardProjection(profile.userId, profile.preferredPosition, stats, {
      attendanceRate: presenceRate,
      checkInRate,
      impactScore,
      sourceSignature: matches.map((match) => `${match.id}:${match.updatedAt}`).sort().join("|") || "empty",
      updatedAt: new Date().toISOString()
    });
    const ratings = { ...buildPlayerCardRatings(stats), overall: projection.score };

    return {
      playerId: profile.userId,
      displayName: profile.displayName,
      stats,
      ratings,
      rank: 0,
      explanation: projection.confidence === "forming" ? "Card em formação: a amostra ainda é pequena." : "Overall calculado pelo histórico registrado."
    };
  });

  const valueFor = (entry: Omit<PlayerRankingEntry, "rank">): number => {
    if (metric === "goals") {
      return entry.stats.goals;
    }

    if (metric === "assists") {
      return entry.stats.assists;
    }

    if (metric === "presence") {
      return presenceRateFor(entry.playerId, matches);
    }

    if (metric === "winning") {
      return entry.ratings.winning;
    }

    if (metric === "form") {
      return entry.ratings.form;
    }

    return entry.ratings.overall;
  };

  return entries
    .sort((left, right) => valueFor(right) - valueFor(left) || right.stats.goals - left.stats.goals)
    .map((entry, index) => playerRankingEntrySchema.parse({ ...entry, rank: index + 1 }));
};

export const rankingRoutes: FastifyPluginAsync = async (app) => {
  const canReadTournament = async (userId: string, tournamentId: string) => {
    const tournament = await app.repositories.tournaments.findById(tournamentId);
    const userTeams = await app.repositories.teams.listByMember(userId);

    if (!tournament || (tournament.visibility !== "public" && tournament.ownerId !== userId && !tournament.teamIds.some((teamId) => userTeams.some((team) => team.id === teamId)))) {
      return null;
    }

    return tournament;
  };

  app.get("/rankings/players", { schema: rankingRouteSchemas.players }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const query = playerRankingQuerySchema.parse(request.query);
    let matches: Match[] = [];

    if (query.tournamentId) {
      const tournament = await canReadTournament(user.id, query.tournamentId);

      if (!tournament) {
        reply.code(404);
        return { message: "Campeonato nao encontrado." };
      }

      matches = await app.repositories.matches.listByTournamentId(tournament.id);
    } else if (query.teamId) {
      const team = await app.repositories.teams.findById(query.teamId);

      if (!canReadTeam(user.id, team)) {
        reply.code(404);
        return { message: "Time nao encontrado." };
      }

      matches = await app.repositories.matches.listByTeamIds([team.id]);
    } else {
      const teams = await app.repositories.teams.listByMember(user.id);
      matches = await app.repositories.matches.listByTeamIds(teams.map((team) => team.id));
    }

    const scopedMatches =
      query.period === "all"
        ? matches
        : [...matches]
            .sort((left, right) => right.playedAt.localeCompare(left.playedAt))
            .slice(0, query.period === "last-5" ? 5 : 10);

    return { players: await buildRanking(app, scopedMatches, query.metric) };
  });

  app.get("/tournaments/:tournamentId/scorers", { schema: rankingRouteSchemas.tournamentScorers }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { tournamentId } = request.params as { tournamentId: string };
    const tournament = await canReadTournament(user.id, tournamentId);

    if (!tournament) {
      reply.code(404);
      return { message: "Campeonato nao encontrado." };
    }

    const matches = await app.repositories.matches.listByTournamentId(tournament.id);
    return { players: await buildRanking(app, matches, "goals") };
  });

  app.get("/tournaments/:tournamentId/assists", { schema: rankingRouteSchemas.tournamentAssists }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { tournamentId } = request.params as { tournamentId: string };
    const tournament = await canReadTournament(user.id, tournamentId);

    if (!tournament) {
      reply.code(404);
      return { message: "Campeonato nao encontrado." };
    }

    const matches = await app.repositories.matches.listByTournamentId(tournament.id);
    return { players: await buildRanking(app, matches, "assists") };
  });
};
