import type { PlayerCardProjection, PlayerRankingEntry, Team } from "@soccer-stats/shared";

export interface DashboardTeamRankingItem {
  id: string;
  name: string;
  points: number;
  goals: number;
  rank: number;
}

export function selectPlayerRankingPreview(players: PlayerRankingEntry[], limit = 5): PlayerRankingEntry[] {
  return [...players].sort((left, right) => left.rank - right.rank).slice(0, limit);
}

export function alignOwnRankingWithCard(players: PlayerRankingEntry[], card: PlayerCardProjection | null): PlayerRankingEntry[] {
  if (!card) {
    return players;
  }

  return players.map((player) =>
    player.playerId === card.playerId
      ? {
          ...player,
          ratings: {
            ...player.ratings,
            overall: card.score
          },
          explanation: card.confidence === "forming" ? "Card em formação." : "Card baseado no histórico do jogador."
        }
      : player
  );
}

export function selectTeamRankingPreview(teams: Team[], limit = 5): DashboardTeamRankingItem[] {
  return [...teams]
    .sort((left, right) => right.stats.points - left.stats.points || right.stats.goals - left.stats.goals)
    .slice(0, limit)
    .map((team, index) => ({
      id: team.id,
      name: team.name,
      points: team.stats.points,
      goals: team.stats.goals,
      rank: index + 1
    }));
}
