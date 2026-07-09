import type { Match, Team, Tournament } from "@soccer-stats/shared";

export interface DashboardMatchSummary {
  match: Match;
  href: string;
  homeName: string;
  awayName: string;
  tournament?: Tournament;
}

export function selectNextMatch(matches: Match[]): Match | null {
  const now = Date.now();

  return [...matches]
    .filter((match) => match.status === "scheduled" || match.status === "confirming")
    .filter((match) => new Date(match.playedAt).getTime() >= now)
    .sort((left, right) => new Date(left.playedAt).getTime() - new Date(right.playedAt).getTime())[0] ?? null;
}

export function selectLatestRelevantMatch(matches: Match[]): Match | null {
  return [...matches]
    .filter((match) => match.status !== "cancelled")
    .sort((left, right) => new Date(right.playedAt).getTime() - new Date(left.playedAt).getTime())[0] ?? null;
}

export function toMatchSummary(match: Match | null, teams: Team[], tournaments: Tournament[]): DashboardMatchSummary | null {
  if (!match) {
    return null;
  }

  const tournament = match.tournamentId ? tournaments.find((item) => item.id === match.tournamentId) : undefined;

  return {
    match,
    href: `/app/matches/${match.id}`,
    homeName: teams.find((team) => team.id === match.home.teamId)?.name ?? "Casa",
    awayName: teams.find((team) => team.id === match.away.teamId)?.name ?? "Fora",
    ...(tournament ? { tournament } : {})
  };
}

export function userNeedsPresence(match: Match, userId: string): boolean {
  const isMatchPlayer = [...match.home.playerIds, ...match.away.playerIds].includes(userId);
  const presence = match.presences.find((item) => item.userId === userId);

  return isMatchPlayer && (match.status === "scheduled" || match.status === "confirming") && (!presence || presence.status === "pending");
}

export function userNeedsCheckIn(match: Match, userId: string): boolean {
  const isMatchPlayer = [...match.home.playerIds, ...match.away.playerIds].includes(userId);
  const checkedIn = match.checkIns.some((item) => item.userId === userId);

  return isMatchPlayer && match.status === "confirming" && !checkedIn;
}
