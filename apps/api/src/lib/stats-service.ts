import { buildRecentHighlight, createEmptyStats, withDerivedStats } from "@soccer-stats/shared";
import type { AggregatedStats, Match, Team, TournamentStanding } from "@soccer-stats/shared";

const applyMatchResult = (
  stats: AggregatedStats,
  goalsFor: number,
  goalsAgainst: number
): AggregatedStats => {
  const result = goalsFor === goalsAgainst ? "D" : goalsFor > goalsAgainst ? "W" : "L";

  const updated: AggregatedStats = {
    ...stats,
    matchesPlayed: stats.matchesPlayed + 1,
    wins: stats.wins + (result === "W" ? 1 : 0),
    draws: stats.draws + (result === "D" ? 1 : 0),
    losses: stats.losses + (result === "L" ? 1 : 0),
    goals: stats.goals + goalsFor,
    goalDifference: stats.goalDifference + (goalsFor - goalsAgainst),
    cleanSheets: stats.cleanSheets + (goalsAgainst === 0 ? 1 : 0),
    points: stats.points + (result === "W" ? 3 : result === "D" ? 1 : 0),
    form: [...stats.form.slice(-4), result]
  };

  return withDerivedStats({
    ...updated,
    recentHighlight: buildRecentHighlight(updated)
  });
};

const applyMatchResultWithoutScoring = (
  stats: AggregatedStats,
  goalsFor: number,
  goalsAgainst: number
): AggregatedStats => {
  const updated = applyMatchResult(stats, goalsFor, goalsAgainst);

  return {
    ...updated,
    goals: stats.goals,
    goalDifference: stats.goalDifference + (goalsFor - goalsAgainst),
    goalsPerMatch: stats.matchesPlayed + 1 === 0 ? 0 : Number((stats.goals / (stats.matchesPlayed + 1)).toFixed(2))
  };
};

export const calculateTeamStats = (team: Team, matches: Match[]): AggregatedStats => {
  let stats = createEmptyStats();

  for (const match of matches) {
    if (match.status !== "completed") {
      continue;
    }

    if (match.home.teamId === team.id) {
      stats = applyMatchResult(stats, match.home.score, match.away.score);
    }

    if (match.away.teamId === team.id) {
      stats = applyMatchResult(stats, match.away.score, match.home.score);
    }
  }

  return stats;
};

export const calculatePlayerStats = (playerId: string, matches: Match[]): AggregatedStats => {
  let stats = createEmptyStats();
  let assists = 0;

  for (const match of matches) {
    if (match.status !== "completed") {
      continue;
    }

    const side =
      match.home.playerIds.includes(playerId) ? match.home : match.away.playerIds.includes(playerId) ? match.away : null;

    const opponent =
      side?.teamId === match.home.teamId ? match.away : side?.teamId === match.away.teamId ? match.home : null;

    if (!side || !opponent) {
      continue;
    }

    stats = applyMatchResultWithoutScoring(stats, side.score, opponent.score);
    stats.goals += match.eventLog.filter((event) => event.type === "goal" && event.playerId === playerId).length;
    assists += match.eventLog.filter((event) => event.type === "assist" && event.playerId === playerId).length;
  }

  return withDerivedStats({
    ...stats,
    assists,
    recentHighlight: buildRecentHighlight({ ...stats, assists })
  });
};

export const calculateStandings = (teams: Team[], matches: Match[]): TournamentStanding[] =>
  teams
    .map((team) => ({
      teamId: team.id,
      stats: calculateTeamStats(team, matches)
    }))
    .sort((left, right) => {
      if (right.stats.points !== left.stats.points) {
        return right.stats.points - left.stats.points;
      }

      if (right.stats.goalDifference !== left.stats.goalDifference) {
        return right.stats.goalDifference - left.stats.goalDifference;
      }

      return right.stats.goals - left.stats.goals;
    });
