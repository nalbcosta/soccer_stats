import type { Invite, Match, PlayerProfile, Team, Tournament } from "@soccer-stats/shared";
import type {
  InviteRepository,
  MatchRepository,
  PlayerProfileRepository,
  Repositories,
  SessionRecord,
  SessionRepository,
  StoredUser,
  TeamRepository,
  TournamentRepository,
  UserRepository
} from "../types.js";

class MemoryUserRepository implements UserRepository {
  private readonly items = new Map<string, StoredUser>();

  async create(input: StoredUser): Promise<StoredUser> {
    this.items.set(input.id, input);
    return input;
  }

  async update(user: StoredUser): Promise<StoredUser> {
    this.items.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.items.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return [...this.items.values()].find((item) => item.email === email) ?? null;
  }

  async findByUsername(username: string): Promise<StoredUser | null> {
    return [...this.items.values()].find((item) => item.username === username) ?? null;
  }
}

class MemoryPlayerProfileRepository implements PlayerProfileRepository {
  private readonly items = new Map<string, PlayerProfile>();

  async upsert(profile: PlayerProfile): Promise<PlayerProfile> {
    this.items.set(profile.userId, profile);
    return profile;
  }

  async findByUserId(userId: string): Promise<PlayerProfile | null> {
    return this.items.get(userId) ?? null;
  }

  async listByUserIds(userIds: string[]): Promise<PlayerProfile[]> {
    return userIds.map((id) => this.items.get(id)).filter((value): value is PlayerProfile => Boolean(value));
  }
}

class MemoryTeamRepository implements TeamRepository {
  private readonly items = new Map<string, Team>();

  async create(team: Team): Promise<Team> {
    this.items.set(team.id, team);
    return team;
  }

  async update(team: Team): Promise<Team> {
    this.items.set(team.id, team);
    return team;
  }

  async findById(id: string): Promise<Team | null> {
    return this.items.get(id) ?? null;
  }

  async listByMember(userId: string): Promise<Team[]> {
    return [...this.items.values()].filter((team) => team.members.some((member) => member.userId === userId));
  }

  async listByIds(ids: string[]): Promise<Team[]> {
    return ids.map((id) => this.items.get(id)).filter((value): value is Team => Boolean(value));
  }
}

class MemoryMatchRepository implements MatchRepository {
  private readonly items = new Map<string, Match>();

  async create(match: Match): Promise<Match> {
    this.items.set(match.id, match);
    return match;
  }

  async update(match: Match): Promise<Match> {
    this.items.set(match.id, match);
    return match;
  }

  async findById(id: string): Promise<Match | null> {
    return this.items.get(id) ?? null;
  }

  async listByTeamIds(teamIds: string[]): Promise<Match[]> {
    return [...this.items.values()].filter((match) => teamIds.includes(match.home.teamId) || teamIds.includes(match.away.teamId));
  }

  async listByTournamentId(tournamentId: string): Promise<Match[]> {
    return [...this.items.values()].filter((match) => match.tournamentId === tournamentId);
  }
}

class MemoryTournamentRepository implements TournamentRepository {
  private readonly items = new Map<string, Tournament>();

  async create(tournament: Tournament): Promise<Tournament> {
    this.items.set(tournament.id, tournament);
    return tournament;
  }

  async update(tournament: Tournament): Promise<Tournament> {
    this.items.set(tournament.id, tournament);
    return tournament;
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.items.get(id) ?? null;
  }

  async listByOwnerOrTeam(userId: string, teamIds: string[]): Promise<Tournament[]> {
    return [...this.items.values()].filter(
      (item) => item.ownerId === userId || item.teamIds.some((teamId) => teamIds.includes(teamId))
    );
  }
}

class MemoryInviteRepository implements InviteRepository {
  private readonly items = new Map<string, Invite>();

  async create(invite: Invite): Promise<Invite> {
    this.items.set(invite.id, invite);
    return invite;
  }

  async update(invite: Invite): Promise<Invite> {
    this.items.set(invite.id, invite);
    return invite;
  }

  async findPendingByEmail(email: string): Promise<Invite[]> {
    return [...this.items.values()].filter((invite) => invite.email === email && invite.status === "pending");
  }

  async listByResource(resourceType: "team" | "tournament", resourceId: string): Promise<Invite[]> {
    return [...this.items.values()].filter(
      (invite) => invite.resourceType === resourceType && invite.resourceId === resourceId
    );
  }
}

class MemorySessionRepository implements SessionRepository {
  private readonly items = new Map<string, SessionRecord>();

  async create(session: SessionRecord): Promise<SessionRecord> {
    this.items.set(session.id, session);
    return session;
  }

  async findById(id: string): Promise<SessionRecord | null> {
    return this.items.get(id) ?? null;
  }

  async deleteById(id: string): Promise<void> {
    this.items.delete(id);
  }
}

export const createMemoryRepositories = (): Repositories => ({
  users: new MemoryUserRepository(),
  playerProfiles: new MemoryPlayerProfileRepository(),
  teams: new MemoryTeamRepository(),
  matches: new MemoryMatchRepository(),
  tournaments: new MemoryTournamentRepository(),
  invites: new MemoryInviteRepository(),
  sessions: new MemorySessionRepository()
});
