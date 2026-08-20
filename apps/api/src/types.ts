import type {
  Invite,
  AuditLog,
  Match,
  MatchComment,
  MatchJoinRequest,
  Notification,
  PlayerProfile,
  PlayerFeatureSnapshot,
  PlayerCardProjection,
  PublicUser,
  SupportedLocale,
  Team,
  TeamJoinRequest,
  TeamMessage,
  ThemeMode,
  Tournament,
  Venue
} from "@soccer-stats/shared";

export interface StoredUser extends PublicUser {
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  userAgent?: string;
  ipHash?: string;
  lastSeenAt?: string;
  revokedAt?: string;
}

export interface AppContext {
  user: StoredUser;
}

export interface Repositories {
  users: UserRepository;
  playerProfiles: PlayerProfileRepository;
  playerFeatureSnapshots: PlayerFeatureSnapshotRepository;
  playerCardProjections: PlayerCardProjectionRepository;
  teams: TeamRepository;
  teamJoinRequests: TeamJoinRequestRepository;
  matchJoinRequests: MatchJoinRequestRepository;
  teamMessages: TeamMessageRepository;
  matchComments: MatchCommentRepository;
  matches: MatchRepository;
  tournaments: TournamentRepository;
  invites: InviteRepository;
  venues: VenueRepository;
  notifications: NotificationRepository;
  auditLogs: AuditLogRepository;
  sessions: SessionRepository;
}

export interface UserRepository {
  create(input: StoredUser): Promise<StoredUser>;
  update(user: StoredUser): Promise<StoredUser>;
  findById(id: string): Promise<StoredUser | null>;
  findByEmail(email: string): Promise<StoredUser | null>;
  findByPublicIdentifier(publicIdentifier: string): Promise<StoredUser | null>;
}

export interface PlayerProfileRepository {
  upsert(profile: PlayerProfile): Promise<PlayerProfile>;
  findByUserId(userId: string): Promise<PlayerProfile | null>;
  listByUserIds(userIds: string[]): Promise<PlayerProfile[]>;
}

export interface PlayerFeatureSnapshotRepository {
  create(snapshot: PlayerFeatureSnapshot & { id: string }): Promise<PlayerFeatureSnapshot & { id: string }>;
  findLatest(playerId: string, filters?: { teamId?: string; tournamentId?: string }): Promise<(PlayerFeatureSnapshot & { id: string }) | null>;
  listByPlayer(playerId: string, filters?: { teamId?: string; tournamentId?: string; limit?: number }): Promise<Array<PlayerFeatureSnapshot & { id: string }>>;
}

export interface PlayerCardProjectionRepository {
  upsert(projection: PlayerCardProjection): Promise<PlayerCardProjection>;
  findByPlayerId(playerId: string): Promise<PlayerCardProjection | null>;
  listByPlayerIds(playerIds: string[]): Promise<PlayerCardProjection[]>;
}

export interface TeamRepository {
  create(team: Team): Promise<Team>;
  update(team: Team): Promise<Team>;
  findById(id: string): Promise<Team | null>;
  listByMember(userId: string): Promise<Team[]>;
  listVisibleToUser(userId: string): Promise<Team[]>;
  listByIds(ids: string[]): Promise<Team[]>;
}

export interface TeamJoinRequestRepository {
  create(request: TeamJoinRequest): Promise<TeamJoinRequest>;
  update(request: TeamJoinRequest): Promise<TeamJoinRequest>;
  findById(id: string): Promise<TeamJoinRequest | null>;
  findByTeamAndUser(teamId: string, userId: string): Promise<TeamJoinRequest | null>;
  listByTeam(teamId: string): Promise<TeamJoinRequest[]>;
}

export interface MatchJoinRequestRepository {
  create(request: MatchJoinRequest): Promise<MatchJoinRequest>;
  update(request: MatchJoinRequest): Promise<MatchJoinRequest>;
  findById(id: string): Promise<MatchJoinRequest | null>;
  findByMatchAndUser(matchId: string, userId: string): Promise<MatchJoinRequest | null>;
  listByMatch(matchId: string): Promise<MatchJoinRequest[]>;
}

export interface TeamMessageRepository {
  create(message: TeamMessage): Promise<TeamMessage>;
  findById(id: string): Promise<TeamMessage | null>;
  listByTeam(teamId: string, page: number, pageSize: number): Promise<TeamMessage[]>;
  deleteById(id: string): Promise<void>;
}

export interface MatchCommentRepository {
  create(comment: MatchComment): Promise<MatchComment>;
  findById(id: string): Promise<MatchComment | null>;
  listByMatch(matchId: string, page: number, pageSize: number): Promise<MatchComment[]>;
  deleteById(id: string): Promise<void>;
}

export interface MatchRepository {
  create(match: Match): Promise<Match>;
  update(match: Match): Promise<Match>;
  findById(id: string): Promise<Match | null>;
  listAll(): Promise<Match[]>;
  listByTeamIds(teamIds: string[]): Promise<Match[]>;
  listByPlayerId(playerId: string): Promise<Match[]>;
  listByTournamentId(tournamentId: string): Promise<Match[]>;
}

export interface TournamentRepository {
  create(tournament: Tournament): Promise<Tournament>;
  update(tournament: Tournament): Promise<Tournament>;
  findById(id: string): Promise<Tournament | null>;
  listByOwnerOrTeam(userId: string, teamIds: string[]): Promise<Tournament[]>;
}

export interface VenueRepository {
  create(venue: Venue): Promise<Venue>;
  update(venue: Venue): Promise<Venue>;
  findById(id: string): Promise<Venue | null>;
  listVisibleToUser(
    userId: string,
    filters?: { city?: string; state?: string; visibility?: Venue["visibility"]; page?: number; pageSize?: number }
  ): Promise<Venue[]>;
}

export interface InviteRepository {
  create(invite: Invite): Promise<Invite>;
  update(invite: Invite): Promise<Invite>;
  findById(id: string): Promise<Invite | null>;
  findByToken(token: string): Promise<Invite | null>;
  findPendingForUser(userId: string, email?: string): Promise<Invite[]>;
  listByResource(resourceType: "team" | "tournament", resourceId: string): Promise<Invite[]>;
}

export interface NotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  listByUser(userId: string): Promise<Notification[]>;
  markRead(id: string, userId: string, readAt: string): Promise<Notification | null>;
  markAllRead(userId: string, readAt: string): Promise<void>;
}

export interface SessionRepository {
  create(session: SessionRecord): Promise<SessionRecord>;
  findById(id: string): Promise<SessionRecord | null>;
  listByUser(userId: string): Promise<SessionRecord[]>;
  update(session: SessionRecord): Promise<SessionRecord>;
  revokeById(id: string, userId: string, revokedAt: string): Promise<SessionRecord | null>;
  revokeAllByUser(userId: string, revokedAt: string, exceptSessionId?: string): Promise<void>;
  deleteById(id: string): Promise<void>;
}

export interface AuditLogRepository {
  create(auditLog: AuditLog): Promise<AuditLog>;
  listByActor(actorUserId: string): Promise<AuditLog[]>;
}

export interface AppConfig {
  port: number;
  mongodbUri: string;
  mongodbDb: string;
  webOrigin: string;
  sessionSecret: string;
  googleClientId: string;
  nodeEnv: "development" | "production" | "test";
  cookieDomain?: string;
  defaultLocale: SupportedLocale;
  defaultTheme: ThemeMode;
  nominatimBaseUrl: string;
  nominatimUserAgent: string;
  nominatimEmail?: string;
}
