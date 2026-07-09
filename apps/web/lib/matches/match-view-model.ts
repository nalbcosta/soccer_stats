import type { Match, MatchEvent, MatchPresence, PublicUser, Team, Tournament, Venue } from "@soccer-stats/shared";
import type { DashboardResponse } from "../api";

export type MatchPageTab = "mine" | "nearby";
export type MatchDetailTab = "overview" | "presence" | "sheet";

export interface MatchListItem {
  match: Match;
  href: string;
  homeName: string;
  awayName: string;
  tournament?: Tournament;
  venueLabel: string;
  dateLabel: string;
  isNearUserRegion: boolean;
}

export interface MatchParticipant {
  userId: string;
  label: string;
  side: "home" | "away";
  teamId: string;
  teamName: string;
  presence?: MatchPresence;
  checkedIn: boolean;
}

export interface MatchSheetSummary {
  goals: MatchGoalSummary[];
  homeGoals: MatchGoalSummary[];
  awayGoals: MatchGoalSummary[];
  scoreMatchesSheet: boolean;
}

export interface MatchGoalSummary {
  event: MatchEvent;
  playerLabel: string;
  assistLabel?: string;
  teamName: string;
}

const surfaceLabels: Record<NonNullable<NonNullable<Match["venue"]>["surface"]>, string> = {
  grass: "Grama",
  synthetic: "Sintético",
  court: "Quadra",
  sand: "Areia",
  other: "Outro"
};

export function resolveTeamName(teams: Team[], teamId: string, fallback: string): string {
  return teams.find((team) => team.id === teamId)?.name ?? fallback;
}

export function formatMatchDate(playedAt: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo"
  })
    .format(new Date(playedAt))
    .replace(",", " •");
}

export function formatVenueLabel(match: Match): string {
  if (match.venue?.name) {
    return match.venue.name;
  }

  if (match.venue?.city || match.venue?.state) {
    return [match.venue.city, match.venue.state].filter(Boolean).join("/");
  }

  if (match.venue?.surface) {
    return surfaceLabels[match.venue.surface];
  }

  return "Local a definir";
}

export function getUserRegion(dashboard: DashboardResponse): { city?: string; state?: string } {
  const teamWithRegion = dashboard.teams.find((team) => team.city || team.state);
  const venueWithRegion = dashboard.venues.find((venue) => venue.city || venue.state);
  const city = teamWithRegion?.city ?? venueWithRegion?.city;
  const state = teamWithRegion?.state ?? venueWithRegion?.state;

  return {
    ...(city ? { city } : {}),
    ...(state ? { state } : {})
  };
}

export function isMatchInRegion(match: Match, venues: Venue[], region: { city?: string; state?: string }): boolean {
  const venue = match.venueId ? venues.find((item) => item.id === match.venueId) : undefined;
  const city = match.venue?.city ?? venue?.city;
  const state = match.venue?.state ?? venue?.state;

  if (region.city && city) {
    return city.toLowerCase() === region.city.toLowerCase();
  }

  if (region.state && state) {
    return state.toLowerCase() === region.state.toLowerCase();
  }

  return false;
}

export function buildMatchListItems(dashboard: DashboardResponse): MatchListItem[] {
  return buildMatchListItemsFromMatches(dashboard.matches, dashboard);
}

export function buildMatchListItemsFromMatches(matches: Match[], dashboard: DashboardResponse): MatchListItem[] {
  const region = getUserRegion(dashboard);

  return [...matches]
    .sort((left, right) => new Date(left.playedAt).getTime() - new Date(right.playedAt).getTime())
    .map((match) => {
      const tournament = match.tournamentId ? dashboard.tournaments.find((item) => item.id === match.tournamentId) : undefined;

      return {
        match,
        href: `/app/matches/${match.id}`,
        homeName: resolveTeamName(dashboard.teams, match.home.teamId, "Casa"),
        awayName: resolveTeamName(dashboard.teams, match.away.teamId, "Fora"),
        ...(tournament ? { tournament } : {}),
        venueLabel: formatVenueLabel(match),
        dateLabel: formatMatchDate(match.playedAt),
        isNearUserRegion: isMatchInRegion(match, dashboard.venues, region)
      };
    });
}

export function selectNearbyMatches(items: MatchListItem[]): MatchListItem[] {
  return items
    .filter((item) => item.match.status === "scheduled" || item.match.status === "confirming")
    .filter((item) => item.isNearUserRegion || item.match.venue || item.match.venueId)
    .slice(0, 10);
}

export function buildParticipants(match: Match, teamNames?: { homeName: string; awayName: string }): MatchParticipant[] {
  const home = match.home.playerIds.map((userId, index) => {
    const presence = match.presences.find((item) => item.userId === userId);

    return {
      userId,
      label: `Jogador ${index + 1}`,
      side: "home" as const,
      teamId: match.home.teamId,
      teamName: teamNames?.homeName ?? "Casa",
      ...(presence ? { presence } : {}),
      checkedIn: match.checkIns.some((checkIn) => checkIn.userId === userId)
    };
  });
  const away = match.away.playerIds.map((userId, index) => {
    const presence = match.presences.find((item) => item.userId === userId);

    return {
      userId,
      label: `Jogador ${index + 1}`,
      side: "away" as const,
      teamId: match.away.teamId,
      teamName: teamNames?.awayName ?? "Fora",
      ...(presence ? { presence } : {}),
      checkedIn: match.checkIns.some((checkIn) => checkIn.userId === userId)
    };
  });

  return [...home, ...away];
}

export function buildSheetSummary(match: Match, participants: MatchParticipant[] = buildParticipants(match)): MatchSheetSummary {
  const goals = match.eventLog
    .filter((event) => event.type === "goal")
    .sort((left, right) => left.minute - right.minute)
    .map((event) => {
      const player = participants.find((participant) => participant.userId === event.playerId);
      const assist = event.assistPlayerId ? participants.find((participant) => participant.userId === event.assistPlayerId) : undefined;

      return {
        event,
        playerLabel: player ? `${player.label} • ${player.teamName}` : "Jogador",
        ...(assist ? { assistLabel: `${assist.label} • ${assist.teamName}` } : {}),
        teamName: player?.teamName ?? "Time"
      };
    });
  const homeGoals = goals.filter((goal) => goal.event.teamId === match.home.teamId);
  const awayGoals = goals.filter((goal) => goal.event.teamId === match.away.teamId);

  return {
    goals,
    homeGoals,
    awayGoals,
    scoreMatchesSheet: homeGoals.length === match.home.score && awayGoals.length === match.away.score
  };
}

export function userCanCheckIn(match: Match, user: PublicUser | null): boolean {
  if (!user) {
    return false;
  }

  return [...match.home.playerIds, ...match.away.playerIds].includes(user.id) && !match.checkIns.some((checkIn) => checkIn.userId === user.id);
}
