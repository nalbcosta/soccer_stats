import type { MatchEvent, MatchVenue, Team, Venue } from "@soccer-stats/shared";

export type LooseVenue = {
  name?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  surface?: MatchVenue["surface"] | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
};

export type LooseMatchEvent = Omit<MatchEvent, "assistPlayerId"> & {
  assistPlayerId?: string | undefined;
};

export const canManageTeam = (userId: string, team: Team | null): team is Team =>
  Boolean(team?.members.some((member) => member.userId === userId && (member.role === "owner" || member.role === "admin")));

export const canOrganizeTeam = (userId: string, team: Team | null): team is Team =>
  Boolean(team?.members.some((member) => member.userId === userId && (member.role === "owner" || member.role === "admin" || member.role === "captain")));

export const cleanVenue = (venue: LooseVenue | undefined): MatchVenue | undefined => {
  if (
    !venue?.name &&
    !venue?.address &&
    !venue?.city &&
    !venue?.state &&
    !venue?.surface &&
    venue?.latitude === undefined &&
    venue?.longitude === undefined
  ) {
    return undefined;
  }

  return {
    ...(venue.name ? { name: venue.name } : {}),
    ...(venue.address ? { address: venue.address } : {}),
    ...(venue.city ? { city: venue.city } : {}),
    ...(venue.state ? { state: venue.state.toUpperCase() } : {}),
    ...(venue.surface ? { surface: venue.surface } : {}),
    ...(venue.latitude !== undefined ? { latitude: venue.latitude } : {}),
    ...(venue.longitude !== undefined ? { longitude: venue.longitude } : {})
  };
};

export const venueToMatchSnapshot = (venue: Venue): MatchVenue => ({
  name: venue.name,
  ...(venue.address ? { address: venue.address } : {}),
  city: venue.city,
  state: venue.state,
  surface: venue.surface,
  ...(venue.latitude !== undefined ? { latitude: venue.latitude } : {}),
  ...(venue.longitude !== undefined ? { longitude: venue.longitude } : {})
});

export const cleanEventLog = (eventLog: LooseMatchEvent[]): MatchEvent[] =>
  eventLog.map((event) => ({
    minute: event.minute,
    type: event.type,
    playerId: event.playerId,
    teamId: event.teamId,
    ...(event.assistPlayerId ? { assistPlayerId: event.assistPlayerId } : {})
  }));

export const teamMemberIds = (teams: Team[]): string[] => [
  ...new Set(teams.flatMap((team) => team.members.map((member) => member.userId)))
];
