import type {
  Invite,
  Match,
  PlayerProfile,
  PublicUser,
  SupportedLocale,
  Team,
  ThemeMode,
  Tournament
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
}

export interface AppContext {
  user: StoredUser;
}

export interface Repositories {
  users: UserRepository;
  playerProfiles: PlayerProfileRepository;
  teams: TeamRepository;
  matches: MatchRepository;
  tournaments: TournamentRepository;
  invites: InviteRepository;
  sessions: SessionRepository;
}

export interface UserRepository {
  create(input: StoredUser): Promise<StoredUser>;
  update(user: StoredUser): Promise<StoredUser>;
  findById(id: string): Promise<StoredUser | null>;
  findByEmail(email: string): Promise<StoredUser | null>;
  findByUsername(username: string): Promise<StoredUser | null>;
}

export interface PlayerProfileRepository {
  upsert(profile: PlayerProfile): Promise<PlayerProfile>;
  findByUserId(userId: string): Promise<PlayerProfile | null>;
  listByUserIds(userIds: string[]): Promise<PlayerProfile[]>;
}

export interface TeamRepository {
  create(team: Team): Promise<Team>;
  update(team: Team): Promise<Team>;
  findById(id: string): Promise<Team | null>;
  listByMember(userId: string): Promise<Team[]>;
  listByIds(ids: string[]): Promise<Team[]>;
}

export interface MatchRepository {
  create(match: Match): Promise<Match>;
  update(match: Match): Promise<Match>;
  findById(id: string): Promise<Match | null>;
  listByTeamIds(teamIds: string[]): Promise<Match[]>;
  listByTournamentId(tournamentId: string): Promise<Match[]>;
}

export interface TournamentRepository {
  create(tournament: Tournament): Promise<Tournament>;
  update(tournament: Tournament): Promise<Tournament>;
  findById(id: string): Promise<Tournament | null>;
  listByOwnerOrTeam(userId: string, teamIds: string[]): Promise<Tournament[]>;
}

export interface InviteRepository {
  create(invite: Invite): Promise<Invite>;
  update(invite: Invite): Promise<Invite>;
  findPendingByEmail(email: string): Promise<Invite[]>;
  listByResource(resourceType: "team" | "tournament", resourceId: string): Promise<Invite[]>;
}

export interface SessionRepository {
  create(session: SessionRecord): Promise<SessionRecord>;
  findById(id: string): Promise<SessionRecord | null>;
  deleteById(id: string): Promise<void>;
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
}
