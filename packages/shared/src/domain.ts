export type SupportedLocale = "pt-BR" | "en";
export type ThemeMode = "light" | "dark" | "system";
export type PlatformRole = "user" | "admin";
export type Role = "owner" | "admin" | "captain" | "member" | "guest";
export type TeamJoinPolicy = "closed" | "request";
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";
export type MatchParticipationPolicy = "closed" | "request";
export type MatchType = "casual" | "tournament";
export type MatchStatus = "scheduled" | "confirming" | "completed" | "cancelled";
export type TournamentFormat = "league";
export type PreferredFoot = "right" | "left" | "both";
export type PlayerPosition =
  | "goalkeeper"
  | "right-back"
  | "center-back"
  | "left-back"
  | "defensive-midfielder"
  | "central-midfielder"
  | "attacking-midfielder"
  | "right-winger"
  | "left-winger"
  | "striker";
export type InviteStatus = "pending" | "accepted" | "revoked";
export type AuthProvider = "credentials" | "google";
export type EntityVisibility = "private" | "public";
export type NotificationType =
  | "invite-created"
  | "invite-accepted"
  | "match-scheduled"
  | "match-completed"
  | "match-cancelled"
  | "presence-updated"
  | "team-member-added"
  | "tournament-updated";
export type PresenceStatus = "pending" | "confirmed" | "declined" | "maybe";
export type RatingVersion = "v1" | "v2";
export type MatchReviewStatus = "none" | "pending" | "approved" | "disputed";

export interface PublicUser {
  id: string;
  publicIdentifier: string;
  email: string;
  username: string;
  locale: SupportedLocale;
  theme: ThemeMode;
  providers: AuthProvider[];
  platformRole: PlatformRole;
}

export interface OutfieldAttributes {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

export interface GoalkeeperAttributes {
  div: number;
  han: number;
  kic: number;
  ref: number;
  spd: number;
  pos: number;
}

export interface AthleteSkillProfile {
  userId: string;
  outfield: OutfieldAttributes;
  isGoalkeeper: boolean;
  goalkeeper?: GoalkeeperAttributes;
  completedAt: string;
  updatedAt: string;
}

export interface TeamAthleteSkillOverride {
  id: string;
  teamId: string;
  userId: string;
  outfield: OutfieldAttributes;
  isGoalkeeper: boolean;
  goalkeeper?: GoalkeeperAttributes;
  updatedBy: string;
  updatedAt: string;
}

export interface TeamAthleteSkillChangeRequest {
  id: string;
  teamId: string;
  userId: string;
  outfield: OutfieldAttributes;
  isGoalkeeper: boolean;
  goalkeeper?: GoalkeeperAttributes;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface TeamAthlete {
  userId: string;
  username?: string;
  displayName: string;
  role: Role;
  effectiveSkills?: AthleteSkillProfile;
  skillOverride?: TeamAthleteSkillOverride;
  skillChangeRequest?: TeamAthleteSkillChangeRequest;
  skillOverrideByName?: string;
  hasSkillOverride: boolean;
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
  photoMetadata?: {
    fileName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  };
  primaryTeamId?: string;
  teamName?: string;
  preferredFoot: PreferredFoot;
  preferredPosition: PlayerPosition;
  bio?: string;
  stats: AggregatedStats;
}

export interface Membership {
  userId: string;
  username?: string;
  role: Role;
  joinedAt: string;
}

export interface MatchPresence {
  userId: string;
  status: PresenceStatus;
  updatedAt: string;
  updatedBy: string;
}

export interface MatchLineup {
  homePlayerIds: string[];
  awayPlayerIds: string[];
  updatedAt: string;
  updatedBy: string;
}

export interface MatchCheckIn {
  userId: string;
  checkedInAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  visibility: EntityVisibility;
  joinPolicy?: TeamJoinPolicy;
  description?: string;
  whatsappGroupUrl?: string;
  logoUrl?: string;
  logoMetadata?: PlayerProfile["photoMetadata"];
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
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
  latitude?: number;
  longitude?: number;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  visibility: EntityVisibility;
  address?: string;
  postalCode?: string;
  addressNumber?: string;
  city: string;
  state: string;
  surface: NonNullable<MatchVenue["surface"]>;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  prices?: {
    minutes60: number;
    minutes90: number;
    minutes120: number;
  };
  status: "active" | "closed";
  ratingAverage: number;
  ratingCount: number;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type ModerationStatus = "pending" | "approved" | "rejected";
export type VenueChangeKind = "create" | "update" | "close" | "reopen";

export interface VenueChangeSet {
  name?: string;
  visibility?: EntityVisibility;
  address?: string;
  postalCode?: string;
  addressNumber?: string;
  city?: string;
  state?: string;
  surface?: Venue["surface"];
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  prices?: Venue["prices"];
}

export interface VenueChangeRequest {
  id: string;
  venueId?: string;
  kind: VenueChangeKind;
  changes: VenueChangeSet;
  status: ModerationStatus;
  submittedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenueReview {
  id: string;
  venueId: string;
  authorId: string;
  rating: number;
  comment?: string;
  status: ModerationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewReason?: string;
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
  participationPolicy?: MatchParticipationPolicy;
  slotsPerSide?: number;
  home: MatchSide;
  away: MatchSide;
  eventLog: MatchEvent[];
  presences: MatchPresence[];
  lineup?: MatchLineup;
  checkIns: MatchCheckIn[];
  reviewStatus: MatchReviewStatus;
  eventLogVersion: number;
  durationMinutes?: number;
  venueId?: string;
  venue?: MatchVenue;
  tournamentId?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  playedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentStanding {
  teamId: string;
  stats: AggregatedStats;
}

export interface TournamentRoundPairing {
  homeTeamId: string;
  awayTeamId: string;
  matchId?: string;
}

export interface TournamentRound {
  round: number;
  pairings: TournamentRoundPairing[];
  createdAt: string;
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
  rounds: TournamentRound[];
  standings: TournamentStanding[];
  createdAt: string;
  updatedAt: string;
}

export interface Invite {
  id: string;
  resourceType: "team" | "tournament";
  resourceId: string;
  recipientUserId?: string;
  recipientPublicIdentifier?: string;
  email?: string;
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

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface PlayerRankingEntry {
  playerId: string;
  displayName: string;
  stats: AggregatedStats;
  ratings: {
    ratingVersion: RatingVersion;
    overall: number;
    attack: number;
    pass: number;
    presence: number;
    regularity: number;
    winning: number;
    form: number;
  };
  rank: number;
  explanation: string;
}

export interface PlayerFeatureSnapshot {
  id?: string;
  playerId: string;
  ratingVersion: RatingVersion;
  teamId?: string;
  tournamentId?: string;
  matchesPlayed: number;
  goalsPerMatch: number;
  assistsPerMatch: number;
  presenceRate: number;
  checkInRate?: number;
  winRate: number;
  recentFormScore: number;
  impactScore?: number;
  createdAt: string;
}

export interface PlayerCardV2Factor {
  key: string;
  label: string;
  value: number;
  weight: number;
}

export interface PlayerCardV2 {
  playerId: string;
  ratingVersion: "v2";
  score: number;
  factors: PlayerCardV2Factor[];
  explanation: string;
  snapshot: PlayerFeatureSnapshot;
}

export interface TeamJoinRequest { id: string; teamId: string; userId: string; status: RequestStatus; requestedAt: string; reviewedAt?: string; reviewedBy?: string; }
export interface MatchJoinRequest { id: string; matchId: string; userId: string; status: RequestStatus; side?: "home" | "away"; requestedAt: string; reviewedAt?: string; reviewedBy?: string; }
export interface MatchComment { id: string; matchId: string; authorId: string; text: string; createdAt: string; }

export type PlayerCardFactorKey =
  | "matches"
  | "goalsPerMatch"
  | "assistsPerMatch"
  | "saves"
  | "cleanSheets"
  | "attendance"
  | "checkIn"
  | "winRate"
  | "form"
  | "impact";

export interface PlayerCardFactor {
  key: PlayerCardFactorKey;
  value: number;
  weight: number;
}

export interface PlayerCardProjection {
  playerId: string;
  ratingVersion: "v3";
  score: number;
  confidence: "forming" | "established";
  stats: AggregatedStats;
  factors: PlayerCardFactor[];
  sourceSignature: string;
  updatedAt: string;
}

export interface PlayerInsight {
  type: "strength" | "opportunity" | "trend";
  title: string;
  message: string;
  scoreImpact: number;
}

export interface StatsImpact {
  matchId: string;
  playerImpacts: Array<{
    playerId: string;
    goals: number;
    assists: number;
    checkedIn: boolean;
    impactScore: number;
  }>;
  teamImpacts: Array<{
    teamId: string;
    pointsDelta: number;
    goalDifferenceDelta: number;
  }>;
}
