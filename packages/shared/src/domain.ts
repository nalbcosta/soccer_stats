export type SupportedLocale = "pt-BR" | "en";
export type ThemeMode = "light" | "dark" | "system";
export type Role = "owner" | "admin" | "member";
export type MatchType = "casual" | "tournament";
export type MatchStatus = "scheduled" | "completed";
export type TournamentFormat = "league";
export type PreferredFoot = "right" | "left" | "both";
export type PlayerPosition = "goalkeeper" | "defender" | "midfielder" | "forward";
export type InviteStatus = "pending" | "accepted" | "revoked";
export type AuthProvider = "credentials" | "google";
export type EntityVisibility = "private" | "public";
export type NotificationType = "invite-created" | "match-scheduled" | "match-completed" | "tournament-updated";

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  locale: SupportedLocale;
  theme: ThemeMode;
  providers: AuthProvider[];
}

export interface AggregatedStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  assists: number;
  saves: number;
  cleanSheets: number;
  goalDifference: number;
  points: number;
  winRate: number;
  goalsPerMatch: number;
  form: Array<"W" | "D" | "L">;
  recentHighlight: string;
}

export interface PlayerProfile {
  userId: string;
  displayName: string;
  shirtNumber?: number;
  photoUrl?: string;
  teamName?: string;
  preferredFoot: PreferredFoot;
  preferredPosition: PlayerPosition;
  bio?: string;
  stats: AggregatedStats;
}

export interface Membership {
  userId: string;
  role: Role;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  visibility: EntityVisibility;
  city?: string;
  state?: string;
  members: Membership[];
  stats: AggregatedStats;
  createdAt: string;
  updatedAt: string;
}

export interface MatchEvent {
  minute: number;
  type: "goal" | "assist" | "yellow-card" | "red-card";
  playerId: string;
  teamId: string;
  assistPlayerId?: string;
}

export interface MatchVenue {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  surface?: "grass" | "synthetic" | "court" | "sand" | "other";
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  visibility: EntityVisibility;
  address?: string;
  city: string;
  state: string;
  surface: NonNullable<MatchVenue["surface"]>;
  createdAt: string;
  updatedAt: string;
}

export interface MatchSide {
  teamId: string;
  score: number;
  playerIds: string[];
}

export interface Match {
  id: string;
  type: MatchType;
  status: MatchStatus;
  createdBy: string;
  home: MatchSide;
  away: MatchSide;
  eventLog: MatchEvent[];
  durationMinutes?: number;
  venueId?: string;
  venue?: MatchVenue;
  tournamentId?: string;
  playedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentStanding {
  teamId: string;
  stats: AggregatedStats;
}

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  format: TournamentFormat;
  visibility: EntityVisibility;
  teamIds: string[];
  matchIds: string[];
  standings: TournamentStanding[];
  createdAt: string;
  updatedAt: string;
}

export interface Invite {
  id: string;
  resourceType: "team" | "tournament";
  resourceId: string;
  email: string;
  role: Exclude<Role, "owner">;
  status: InviteStatus;
  invitedBy: string;
  token?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, string>;
  readAt?: string;
  createdAt: string;
}
