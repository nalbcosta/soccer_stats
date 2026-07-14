import {
  buildPlayerCardV2,
  buildPlayerCardProjection,
  buildPlayerFeatureSnapshotV2,
  buildPlayerInsightsV2,
  playerCardV2Schema,
  playerInsightSchema,
  statsImpactSchema
} from "@soccer-stats/shared";
import type { Match, PlayerCardProjection, PlayerCardV2, PlayerInsight, StatsImpact, Team } from "@soccer-stats/shared";
import type { Repositories } from "../../types.js";
import { createId } from "../../lib/ids.js";
import { calculatePlayerStats, calculateStandings, calculateTeamStats } from "../../lib/stats-service.js";

const unique = <T>(items: T[]): T[] => [...new Set(items)];

export class StatsService {
  constructor(private readonly repositories: Repositories) {}

  async recalculateAfterMatch(match: Match): Promise<void> {
    const involvedTeams = await this.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);
    const teamMatches = await this.repositories.matches.listByTeamIds(involvedTeams.map((team) => team.id));

    await Promise.all(
      involvedTeams.map(async (team) => {
        await this.repositories.teams.update({
          ...team,
          stats: calculateTeamStats(team, teamMatches),
          updatedAt: new Date().toISOString()
        });
      })
    );

    const playerIds = unique([...(match.lineup?.homePlayerIds ?? match.home.playerIds), ...(match.lineup?.awayPlayerIds ?? match.away.playerIds)]);
    await Promise.all(
      playerIds.map(async (playerId) => {
        const profile = await this.repositories.playerProfiles.findByUserId(playerId);

        if (!profile) {
          return;
        }

        const playerMatches = await this.repositories.matches.listByPlayerId(playerId);
        await this.repositories.playerProfiles.upsert({
          ...profile,
          stats: calculatePlayerStats(playerId, playerMatches)
        });
        await this.rebuildPlayerCardProjection(playerId);
      })
    );

    if (match.tournamentId) {
      const tournament = await this.repositories.tournaments.findById(match.tournamentId);

      if (tournament) {
        const teams = await this.repositories.teams.listByIds(tournament.teamIds);
        const matches = await this.repositories.matches.listByTournamentId(tournament.id);
        await this.repositories.tournaments.update({
          ...tournament,
          matchIds: unique([...tournament.matchIds, match.id]),
          standings: calculateStandings(teams, matches),
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  async refreshPlayerCardProjection(playerId: string): Promise<void> {
    const profile = await this.repositories.playerProfiles.findByUserId(playerId);
    if (!profile) return;

    const matches = await this.repositories.matches.listByPlayerId(playerId);
    const stats = calculatePlayerStats(playerId, matches);
    await this.repositories.playerProfiles.upsert({ ...profile, stats });
    await this.rebuildPlayerCardProjection(playerId, matches, stats);
  }

  async getPlayerCardProjection(playerId: string): Promise<PlayerCardProjection | null> {
    const projection = await this.repositories.playerCardProjections.findByPlayerId(playerId);
    if (projection) return projection;

    return this.createPlayerCardProjection(playerId, false);
  }

  private async rebuildPlayerCardProjection(playerId: string, matches?: Match[], stats?: PlayerCardProjection["stats"]): Promise<PlayerCardProjection | null> {
    return this.createPlayerCardProjection(playerId, true, matches, stats);
  }

  private async createPlayerCardProjection(
    playerId: string,
    persist: boolean,
    suppliedMatches?: Match[],
    suppliedStats?: PlayerCardProjection["stats"]
  ): Promise<PlayerCardProjection | null> {
    const profile = await this.repositories.playerProfiles.findByUserId(playerId);
    if (!profile) return null;

    const matches = suppliedMatches ?? (await this.repositories.matches.listByPlayerId(playerId));
    const stats = suppliedStats ?? calculatePlayerStats(playerId, matches);
    const presences = matches.flatMap((match) => match.presences ?? []).filter((presence) => presence.userId === playerId);
    const attendanceRate = presences.length === 0 ? 0 : Number(((presences.filter((presence) => presence.status === "confirmed").length / presences.length) * 100).toFixed(1));
    const checkInRate = matches.length === 0 ? 0 : Number(((matches.filter((match) => (match.checkIns ?? []).some((checkIn) => checkIn.userId === playerId)).length / matches.length) * 100).toFixed(1));
    const impactScore = matches.filter((match) => match.status === "completed").reduce((total, match) => {
      const impact = this.buildStatsImpact(match).playerImpacts.find((item) => item.playerId === playerId);
      return total + (impact?.impactScore ?? 0);
    }, 0);
    const sourceSignature = matches
      .map((match) => `${match.id}:${match.status}:${match.updatedAt}:${match.eventLogVersion}:${(match.presences ?? []).map((presence) => `${presence.userId}-${presence.status}-${presence.updatedAt}`).join(",")}:${(match.checkIns ?? []).map((checkIn) => `${checkIn.userId}-${checkIn.checkedInAt}`).join(",")}`)
      .sort()
      .join("|") || "empty";
    const projectionSignature = `${profile.preferredPosition}|${sourceSignature}`;
    const projection = buildPlayerCardProjection(playerId, profile.preferredPosition, stats, {
      attendanceRate,
      checkInRate,
      impactScore,
      sourceSignature: projectionSignature,
      updatedAt: new Date().toISOString()
    });

    if (!persist) return projection;
    const current = await this.repositories.playerCardProjections.findByPlayerId(playerId);
    if (current?.sourceSignature === projectionSignature) return current;
    const snapshot = buildPlayerFeatureSnapshotV2(playerId, stats, { presenceRate: attendanceRate, checkInRate, impactScore });
    await this.repositories.playerFeatureSnapshots.create({ ...snapshot, id: createId() });
    return this.repositories.playerCardProjections.upsert(projection);
  }

  buildStatsImpact(match: Match): StatsImpact {
    const playerIds = unique([...(match.lineup?.homePlayerIds ?? match.home.playerIds), ...(match.lineup?.awayPlayerIds ?? match.away.playerIds)]);
    const playerImpacts = playerIds.map((playerId) => {
      const goals = match.eventLog.filter((event) => event.type === "goal" && event.playerId === playerId).length;
      const assists = match.eventLog.filter(
        (event) => (event.type === "assist" && event.playerId === playerId) || (event.type === "goal" && event.assistPlayerId === playerId)
      ).length;
      const checkedIn = (match.checkIns ?? []).some((checkIn) => checkIn.userId === playerId);

      return {
        playerId,
        goals,
        assists,
        checkedIn,
        impactScore: Number((goals * 3 + assists * 2 + (checkedIn ? 1 : 0)).toFixed(1))
      };
    });

    const resultFor = (team: Team["id"]) => {
      const own = match.home.teamId === team ? match.home : match.away;
      const other = match.home.teamId === team ? match.away : match.home;
      return {
        teamId: team,
        pointsDelta: own.score === other.score ? 1 : own.score > other.score ? 3 : 0,
        goalDifferenceDelta: own.score - other.score
      };
    };

    return statsImpactSchema.parse({
      matchId: match.id,
      playerImpacts,
      teamImpacts: [resultFor(match.home.teamId), resultFor(match.away.teamId)]
    });
  }

  async buildPlayerCard(playerId: string, matches: Match[], options: { teamId?: string; tournamentId?: string } = {}): Promise<PlayerCardV2 | null> {
    const profile = await this.repositories.playerProfiles.findByUserId(playerId);

    if (!profile) {
      return null;
    }

    const completedMatches = matches.filter((match) => match.status === "completed");
    const stats = calculatePlayerStats(playerId, completedMatches);
    const presences = matches.flatMap((match) => match.presences ?? []).filter((presence) => presence.userId === playerId);
    const presenceRate = presences.length === 0 ? 0 : Number(((presences.filter((presence) => presence.status === "confirmed").length / presences.length) * 100).toFixed(1));
    const relatedMatches = matches.filter((match) => [...match.home.playerIds, ...match.away.playerIds].includes(playerId));
    const checkInRate = relatedMatches.length === 0 ? 0 : Number(((relatedMatches.filter((match) => (match.checkIns ?? []).some((checkIn) => checkIn.userId === playerId)).length / relatedMatches.length) * 100).toFixed(1));
    const impactScore = completedMatches.reduce((total, match) => {
      const impact = this.buildStatsImpact(match).playerImpacts.find((item) => item.playerId === playerId);
      return total + (impact?.impactScore ?? 0);
    }, 0);
    const snapshot = buildPlayerFeatureSnapshotV2(playerId, stats, {
      ...options,
      presenceRate,
      checkInRate,
      impactScore
    });
    const card = buildPlayerCardV2(snapshot);
    playerCardV2Schema.parse(card);
    return card;
  }

  buildInsights(card: PlayerCardV2): PlayerInsight[] {
    return buildPlayerInsightsV2(card).map((insight) => playerInsightSchema.parse(insight));
  }

  buildProjectionInsights(card: PlayerCardProjection): PlayerInsight[] {
    const factors = [...card.factors].sort((left, right) => right.value * right.weight - left.value * left.weight);
    const strongest = factors[0];
    const weakest = factors.at(-1);
    return [
      ...(strongest ? [{ type: "strength" as const, title: strongest.key, message: "Principal fator do overall atual.", scoreImpact: Number((strongest.value * strongest.weight).toFixed(1)) }] : []),
      ...(weakest ? [{ type: "opportunity" as const, title: weakest.key, message: "Fator com maior espaço para evolução.", scoreImpact: Number((weakest.value * weakest.weight).toFixed(1)) }] : []),
      { type: "trend" as const, title: "confidence", message: card.confidence === "forming" ? "A amostra ainda está em formação." : "A amostra já está consolidada.", scoreImpact: card.stats.matchesPlayed }
    ].map((insight) => playerInsightSchema.parse(insight));
  }
}
