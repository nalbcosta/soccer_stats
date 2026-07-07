import { MongoClient } from "mongodb";
import type { Collection, Filter, WithId } from "mongodb";
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

type Doc<T> = T & { _id: string };

const normalize = <T extends object>(doc: WithId<Doc<T>> | null): T | null => {
  if (!doc) {
    return null;
  }

  const { _id, ...rest } = doc;
  return { ...rest, id: _id } as unknown as T;
};

class BaseMongoRepository<T extends { id: string }> {
  constructor(protected readonly collection: Collection<Doc<T>>) {}

  protected async save(item: T): Promise<T> {
    await this.collection.updateOne({ _id: item.id } as Filter<Doc<T>>, { $set: { ...item, _id: item.id } }, { upsert: true });
    return item;
  }
}

class MongoUserRepository implements UserRepository {
  constructor(private readonly collection: Collection<Doc<StoredUser>>) {}

  async create(input: StoredUser): Promise<StoredUser> {
    await this.collection.insertOne({ ...input, _id: input.id });
    return input;
  }

  async update(user: StoredUser): Promise<StoredUser> {
    await this.collection.updateOne({ _id: user.id }, { $set: { ...user, _id: user.id } });
    return user;
  }

  async findById(id: string): Promise<StoredUser | null> {
    return normalize(await this.collection.findOne({ _id: id }));
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return normalize(await this.collection.findOne({ email }));
  }

  async findByUsername(username: string): Promise<StoredUser | null> {
    return normalize(await this.collection.findOne({ username }));
  }
}

class MongoPlayerProfileRepository implements PlayerProfileRepository {
  constructor(private readonly collection: Collection<Doc<PlayerProfile>>) {}

  async upsert(profile: PlayerProfile): Promise<PlayerProfile> {
    await this.collection.updateOne(
      { _id: profile.userId },
      { $set: { ...profile, _id: profile.userId } as Doc<PlayerProfile> },
      { upsert: true }
    );
    return profile;
  }

  async findByUserId(userId: string): Promise<PlayerProfile | null> {
    const doc = await this.collection.findOne({ _id: userId });
    if (!doc) {
      return null;
    }
    const { _id: _ignored, ...rest } = doc;
    return rest;
  }

  async listByUserIds(userIds: string[]): Promise<PlayerProfile[]> {
    return (await this.collection.find({ _id: { $in: userIds } }).toArray()).map((doc) => {
      const { _id: _ignored, ...rest } = doc;
      return rest;
    });
  }
}

class MongoTeamRepository extends BaseMongoRepository<Team> implements TeamRepository {
  async create(team: Team): Promise<Team> {
    return this.save(team);
  }

  async update(team: Team): Promise<Team> {
    return this.save(team);
  }

  async findById(id: string): Promise<Team | null> {
    return normalize(await this.collection.findOne({ _id: id }));
  }

  async listByMember(userId: string): Promise<Team[]> {
    return (await this.collection.find({ "members.userId": userId }).toArray()).map((doc) => normalize(doc)).filter(Boolean) as Team[];
  }

  async listByIds(ids: string[]): Promise<Team[]> {
    return (await this.collection.find({ _id: { $in: ids } }).toArray()).map((doc) => normalize(doc)).filter(Boolean) as Team[];
  }
}

class MongoMatchRepository extends BaseMongoRepository<Match> implements MatchRepository {
  async create(match: Match): Promise<Match> {
    return this.save(match);
  }

  async update(match: Match): Promise<Match> {
    return this.save(match);
  }

  async findById(id: string): Promise<Match | null> {
    return normalize(await this.collection.findOne({ _id: id }));
  }

  async listByTeamIds(teamIds: string[]): Promise<Match[]> {
    return (await this.collection.find({ $or: [{ "home.teamId": { $in: teamIds } }, { "away.teamId": { $in: teamIds } }] }).toArray()).map((doc) => normalize(doc)).filter(Boolean) as Match[];
  }

  async listByTournamentId(tournamentId: string): Promise<Match[]> {
    return (await this.collection.find({ tournamentId }).toArray()).map((doc) => normalize(doc)).filter(Boolean) as Match[];
  }
}

class MongoTournamentRepository extends BaseMongoRepository<Tournament> implements TournamentRepository {
  async create(tournament: Tournament): Promise<Tournament> {
    return this.save(tournament);
  }

  async update(tournament: Tournament): Promise<Tournament> {
    return this.save(tournament);
  }

  async findById(id: string): Promise<Tournament | null> {
    return normalize(await this.collection.findOne({ _id: id }));
  }

  async listByOwnerOrTeam(userId: string, teamIds: string[]): Promise<Tournament[]> {
    return (await this.collection.find({ $or: [{ ownerId: userId }, { teamIds: { $in: teamIds } }] }).toArray()).map((doc) => normalize(doc)).filter(Boolean) as Tournament[];
  }
}

class MongoInviteRepository extends BaseMongoRepository<Invite> implements InviteRepository {
  async create(invite: Invite): Promise<Invite> {
    return this.save(invite);
  }

  async update(invite: Invite): Promise<Invite> {
    return this.save(invite);
  }

  async findPendingByEmail(email: string): Promise<Invite[]> {
    return (await this.collection.find({ email, status: "pending" }).toArray()).map((doc) => normalize(doc)).filter(Boolean) as Invite[];
  }

  async listByResource(resourceType: "team" | "tournament", resourceId: string): Promise<Invite[]> {
    return (await this.collection.find({ resourceType, resourceId }).toArray()).map((doc) => normalize(doc)).filter(Boolean) as Invite[];
  }
}

class MongoSessionRepository extends BaseMongoRepository<SessionRecord> implements SessionRepository {
  async create(session: SessionRecord): Promise<SessionRecord> {
    return this.save(session);
  }

  async findById(id: string): Promise<SessionRecord | null> {
    return normalize(await this.collection.findOne({ _id: id }));
  }

  async deleteById(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }
}

export interface MongoPersistence {
  client: MongoClient;
  repositories: Repositories;
}

export const createMongoRepositories = async (uri: string, dbName: string): Promise<MongoPersistence> => {
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);

  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("users").createIndex({ username: 1 }, { unique: true }),
    db.collection("teams").createIndex({ slug: 1 }, { unique: true }),
    db.collection("matches").createIndex({ tournamentId: 1 }),
    db.collection("matches").createIndex({ playedAt: -1 }),
    db.collection("matches").createIndex({ status: 1 }),
    db.collection("matches").createIndex({ "home.teamId": 1, "away.teamId": 1 }),
    db.collection("tournaments").createIndex({ slug: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  ]);

  return {
    client,
    repositories: {
      users: new MongoUserRepository(db.collection("users")),
      playerProfiles: new MongoPlayerProfileRepository(db.collection("player_profiles")),
      teams: new MongoTeamRepository(db.collection("teams")),
      matches: new MongoMatchRepository(db.collection("matches")),
      tournaments: new MongoTournamentRepository(db.collection("tournaments")),
      invites: new MongoInviteRepository(db.collection("invites")),
      sessions: new MongoSessionRepository(db.collection("sessions"))
    }
  };
};
