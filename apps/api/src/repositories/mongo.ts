import mongoose, { Schema, type Connection, type Model } from "mongoose";
import type { AuditLog, Invite, Match, MatchComment, MatchJoinRequest, Notification, PlayerCardProjection, PlayerFeatureSnapshot, PlayerProfile, Team, TeamJoinRequest, TeamMessage, Tournament, Venue } from "@soccer-stats/shared";
import type {
  AuditLogRepository,
  InviteRepository,
  MatchRepository,
  NotificationRepository,
  PlayerProfileRepository,
  PlayerFeatureSnapshotRepository,
  PlayerCardProjectionRepository,
  Repositories,
  SessionRecord,
  SessionRepository,
  StoredUser,
  TeamRepository,
  TeamJoinRequestRepository,
  MatchJoinRequestRepository,
  TeamMessageRepository,
  MatchCommentRepository,
  TournamentRepository,
  UserRepository,
  VenueRepository
} from "../types.js";

type Persisted<T> = Omit<T, "id"> & { _id: string };

const clean = <T extends object>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const toDomain = <T extends { id: string }>(doc: Persisted<T> | null): T | null => {
  if (!doc) {
    return null;
  }

  const { _id, ...rest } = clean(doc);
  return { ...rest, id: _id } as unknown as T;
};

const statsSchema = new Schema(
  {
    matchesPlayed: { type: Number, required: true, min: 0 },
    wins: { type: Number, required: true, min: 0 },
    draws: { type: Number, required: true, min: 0 },
    losses: { type: Number, required: true, min: 0 },
    goals: { type: Number, required: true, min: 0 },
    assists: { type: Number, required: true, min: 0 },
    saves: { type: Number, required: true, min: 0 },
    cleanSheets: { type: Number, required: true, min: 0 },
    goalDifference: { type: Number, required: true },
    points: { type: Number, required: true, min: 0 },
    winRate: { type: Number, required: true, min: 0 },
    goalsPerMatch: { type: Number, required: true, min: 0 },
    form: [{ type: String, enum: ["W", "D", "L"] }],
    recentHighlight: { type: String, required: true }
  },
  { _id: false }
);

const membershipSchema = new Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ["owner", "admin", "captain", "member", "guest"], required: true },
    joinedAt: { type: String, required: true }
  },
  { _id: false }
);

const matchSideSchema = new Schema(
  {
    teamId: { type: String, required: true },
    score: { type: Number, required: true, min: 0 },
    playerIds: [{ type: String, required: true }]
  },
  { _id: false }
);

const matchVenueSchema = new Schema(
  {
    name: String,
    address: String,
    city: String,
    state: String,
    surface: { type: String, enum: ["grass", "synthetic", "court", "sand", "other"] },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 }
  },
  { _id: false }
);

const matchEventSchema = new Schema(
  {
    minute: { type: Number, required: true, min: 0, max: 130 },
    type: { type: String, enum: ["goal", "assist", "yellow-card", "red-card"], required: true },
    playerId: { type: String, required: true },
    teamId: { type: String, required: true },
    assistPlayerId: String
  },
  { _id: false }
);

const matchPresenceSchema = new Schema(
  {
    userId: { type: String, required: true },
    status: { type: String, enum: ["pending", "confirmed", "declined", "maybe"], required: true },
    updatedAt: { type: String, required: true },
    updatedBy: { type: String, required: true }
  },
  { _id: false }
);

const matchLineupSchema = new Schema(
  {
    homePlayerIds: [{ type: String, required: true }],
    awayPlayerIds: [{ type: String, required: true }],
    updatedAt: { type: String, required: true },
    updatedBy: { type: String, required: true }
  },
  { _id: false }
);

const matchCheckInSchema = new Schema(
  {
    userId: { type: String, required: true },
    checkedInAt: { type: String, required: true }
  },
  { _id: false }
);

const modelsFor = (connection: Connection) => {
  const userSchema = new Schema<Persisted<StoredUser>>(
    {
      _id: { type: String, required: true },
      email: { type: String, required: true, unique: true, index: true },
      username: { type: String, required: true, unique: true, index: true },
      locale: { type: String, enum: ["pt-BR", "en"], required: true },
      theme: { type: String, enum: ["light", "dark", "system"], required: true },
      providers: [{ type: String, enum: ["credentials", "google"], required: true }],
      passwordHash: String,
      createdAt: { type: String, required: true },
      updatedAt: { type: String, required: true }
    },
    { collection: "users", versionKey: false }
  );

  const playerProfileSchema = new Schema<Persisted<PlayerProfile>>(
    {
      _id: { type: String, required: true },
      userId: { type: String, required: true, unique: true, index: true },
      displayName: { type: String, required: true },
      shirtNumber: Number,
      photoUrl: String,
      photoMetadata: {
        fileName: String,
        mimeType: { type: String, enum: ["image/jpeg", "image/png", "image/webp"] },
        size: Number,
        uploadedAt: String
      },
      primaryTeamId: String,
      teamName: String,
      preferredFoot: { type: String, enum: ["right", "left", "both"], required: true },
      preferredPosition: { type: String, enum: ["goalkeeper", "right-back", "center-back", "left-back", "defensive-midfielder", "central-midfielder", "attacking-midfielder", "right-winger", "left-winger", "striker"], required: true },
      bio: String,
      stats: { type: statsSchema, required: true }
    },
    { collection: "player_profiles", versionKey: false }
  );

  const teamSchema = new Schema<Persisted<Team>>(
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      ownerId: { type: String, required: true, index: true },
      visibility: { type: String, enum: ["private", "public"], required: true, default: "private", index: true },
      joinPolicy: { type: String, enum: ["closed", "request"], required: true, default: "closed", index: true },
      description: String,
      logoUrl: String,
      logoMetadata: { fileName: String, mimeType: { type: String, enum: ["image/jpeg", "image/png", "image/webp"] }, size: Number, uploadedAt: String },
      city: String,
      state: String,
      latitude: Number,
      longitude: Number,
      members: [membershipSchema],
      stats: { type: statsSchema, required: true },
      createdAt: { type: String, required: true },
      updatedAt: { type: String, required: true }
    },
    { collection: "teams", versionKey: false }
  );
  teamSchema.index({ "members.userId": 1 });
  teamSchema.index({ visibility: 1, joinPolicy: 1, city: 1, state: 1 });

  const matchSchema = new Schema<Persisted<Match>>(
    {
      _id: { type: String, required: true },
      type: { type: String, enum: ["casual", "tournament"], required: true },
      status: { type: String, enum: ["scheduled", "confirming", "completed", "cancelled"], required: true, index: true },
      createdBy: { type: String, required: true },
      participationPolicy: { type: String, enum: ["closed", "request"], required: true, default: "closed", index: true },
      slotsPerSide: { type: Number, min: 1, max: 30 },
      home: { type: matchSideSchema, required: true },
      away: { type: matchSideSchema, required: true },
      eventLog: [matchEventSchema],
      presences: [matchPresenceSchema],
      lineup: matchLineupSchema,
      checkIns: [matchCheckInSchema],
      reviewStatus: { type: String, enum: ["none", "pending", "approved", "disputed"], required: true, default: "none", index: true },
      eventLogVersion: { type: Number, required: true, default: 1, min: 1 },
      durationMinutes: Number,
      venueId: { type: String, index: true },
      venue: matchVenueSchema,
      tournamentId: { type: String, index: true },
      cancelledAt: String,
      cancelledBy: String,
      cancelReason: String,
      playedAt: { type: String, required: true, index: true },
      createdAt: { type: String, required: true },
      updatedAt: { type: String, required: true }
    },
    { collection: "matches", versionKey: false }
  );
  matchSchema.index({ "home.teamId": 1 });
  matchSchema.index({ "away.teamId": 1 });

  const teamJoinRequestSchema = new Schema<Persisted<TeamJoinRequest>>({ _id: { type: String, required: true }, teamId: { type: String, required: true, index: true }, userId: { type: String, required: true, index: true }, status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], required: true, index: true }, requestedAt: { type: String, required: true }, reviewedAt: String, reviewedBy: String }, { collection: "team_join_requests", versionKey: false });
  teamJoinRequestSchema.index({ teamId: 1, userId: 1, status: 1 });
  const matchJoinRequestSchema = new Schema<Persisted<MatchJoinRequest>>({ _id: { type: String, required: true }, matchId: { type: String, required: true, index: true }, userId: { type: String, required: true, index: true }, status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], required: true, index: true }, side: { type: String, enum: ["home", "away"] }, requestedAt: { type: String, required: true }, reviewedAt: String, reviewedBy: String }, { collection: "match_join_requests", versionKey: false });
  matchJoinRequestSchema.index({ matchId: 1, userId: 1, status: 1 });
  const teamMessageSchema = new Schema<Persisted<TeamMessage>>({ _id: { type: String, required: true }, teamId: { type: String, required: true, index: true }, authorId: { type: String, required: true }, text: { type: String, required: true, maxlength: 1000 }, createdAt: { type: String, required: true, index: true } }, { collection: "team_messages", versionKey: false });
  const matchCommentSchema = new Schema<Persisted<MatchComment>>({ _id: { type: String, required: true }, matchId: { type: String, required: true, index: true }, authorId: { type: String, required: true }, text: { type: String, required: true, maxlength: 1000 }, createdAt: { type: String, required: true, index: true } }, { collection: "match_comments", versionKey: false });

  const tournamentSchema = new Schema<Persisted<Tournament>>(
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      ownerId: { type: String, required: true, index: true },
      format: { type: String, enum: ["league"], required: true },
      visibility: { type: String, enum: ["private", "public"], required: true, default: "private", index: true },
      teamIds: [{ type: String, required: true }],
      matchIds: [{ type: String, required: true }],
      rounds: [
        new Schema(
          {
            round: { type: Number, required: true },
            pairings: [
              new Schema(
                {
                  homeTeamId: { type: String, required: true },
                  awayTeamId: { type: String, required: true },
                  matchId: String
                },
                { _id: false }
              )
            ],
            createdAt: { type: String, required: true }
          },
          { _id: false }
        )
      ],
      standings: [
        new Schema(
          {
            teamId: { type: String, required: true },
            stats: { type: statsSchema, required: true }
          },
          { _id: false }
        )
      ],
      createdAt: { type: String, required: true },
      updatedAt: { type: String, required: true }
    },
    { collection: "tournaments", versionKey: false }
  );
  tournamentSchema.index({ teamIds: 1 });

  const venueSchema = new Schema<Persisted<Venue>>(
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      ownerId: { type: String, required: true, index: true },
      visibility: { type: String, enum: ["private", "public"], required: true, default: "private", index: true },
      address: String,
      city: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
      surface: { type: String, enum: ["grass", "synthetic", "court", "sand", "other"], required: true },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
      createdAt: { type: String, required: true },
      updatedAt: { type: String, required: true }
    },
    { collection: "venues", versionKey: false }
  );
  venueSchema.index({ city: 1, state: 1, visibility: 1 });

  const inviteSchema = new Schema<Persisted<Invite>>(
    {
      _id: { type: String, required: true },
      resourceType: { type: String, enum: ["team", "tournament"], required: true },
      resourceId: { type: String, required: true, index: true },
      email: { type: String, required: true, index: true },
      role: { type: String, enum: ["admin", "member"], required: true },
      status: { type: String, enum: ["pending", "accepted", "revoked"], required: true, index: true },
      invitedBy: { type: String, required: true },
      token: { type: String, index: true },
      expiresAt: String,
      createdAt: { type: String, required: true }
    },
    { collection: "invites", versionKey: false }
  );

  const notificationSchema = new Schema<Persisted<Notification>>(
    {
      _id: { type: String, required: true },
      userId: { type: String, required: true, index: true },
      type: {
        type: String,
        enum: [
          "invite-created",
          "invite-accepted",
          "match-scheduled",
          "match-completed",
          "match-cancelled",
          "presence-updated",
          "team-member-added",
          "tournament-updated"
        ],
        required: true
      },
      title: { type: String, required: true },
      message: { type: String, required: true },
      metadata: { type: Map, of: String },
      readAt: String,
      createdAt: { type: String, required: true, index: true }
    },
    { collection: "notifications", versionKey: false }
  );
  notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

  const sessionSchema = new Schema<Persisted<SessionRecord>>(
    {
      _id: { type: String, required: true },
      userId: { type: String, required: true, index: true },
      expiresAt: { type: String, required: true, index: true },
      createdAt: { type: String, required: true },
      userAgent: String,
      ipHash: String,
      lastSeenAt: String,
      revokedAt: { type: String, index: true }
    },
    { collection: "sessions", versionKey: false }
  );

  const auditLogSchema = new Schema<Persisted<AuditLog>>(
    {
      _id: { type: String, required: true },
      actorUserId: { type: String, required: true, index: true },
      action: { type: String, required: true, index: true },
      resourceType: { type: String, required: true, index: true },
      resourceId: { type: String, required: true, index: true },
      metadata: { type: Map, of: String },
      createdAt: { type: String, required: true, index: true }
    },
    { collection: "audit_logs", versionKey: false }
  );

  const playerFeatureSnapshotSchema = new Schema<Persisted<PlayerFeatureSnapshot & { id: string }>>(
    {
      _id: { type: String, required: true },
      playerId: { type: String, required: true, index: true },
      ratingVersion: { type: String, enum: ["v1", "v2"], required: true, index: true },
      teamId: { type: String, index: true },
      tournamentId: { type: String, index: true },
      matchesPlayed: { type: Number, required: true, min: 0 },
      goalsPerMatch: { type: Number, required: true, min: 0 },
      assistsPerMatch: { type: Number, required: true, min: 0 },
      presenceRate: { type: Number, required: true, min: 0 },
      checkInRate: { type: Number, min: 0 },
      winRate: { type: Number, required: true, min: 0 },
      recentFormScore: { type: Number, required: true, min: 0 },
      impactScore: Number,
      createdAt: { type: String, required: true, index: true }
    },
    { collection: "player_feature_snapshots", versionKey: false }
  );
  playerFeatureSnapshotSchema.index({ playerId: 1, teamId: 1, tournamentId: 1, createdAt: -1 });

  const playerCardProjectionSchema = new Schema<Persisted<PlayerCardProjection>>(
    {
      _id: { type: String, required: true },
      ratingVersion: { type: String, enum: ["v3"], required: true },
      score: { type: Number, required: true, min: 35, max: 99 },
      confidence: { type: String, enum: ["forming", "established"], required: true },
      stats: { type: statsSchema, required: true },
      factors: [{ key: { type: String, required: true }, value: { type: Number, required: true }, weight: { type: Number, required: true } }],
      sourceSignature: { type: String, required: true },
      updatedAt: { type: String, required: true, index: true }
    },
    { collection: "player_card_projections", versionKey: false }
  );

  return {
    users: connection.model<Persisted<StoredUser>>("User", userSchema),
    playerProfiles: connection.model<Persisted<PlayerProfile>>("PlayerProfile", playerProfileSchema),
    teams: connection.model<Persisted<Team>>("Team", teamSchema),
    teamJoinRequests: connection.model<Persisted<TeamJoinRequest>>("TeamJoinRequest", teamJoinRequestSchema),
    matchJoinRequests: connection.model<Persisted<MatchJoinRequest>>("MatchJoinRequest", matchJoinRequestSchema),
    teamMessages: connection.model<Persisted<TeamMessage>>("TeamMessage", teamMessageSchema),
    matchComments: connection.model<Persisted<MatchComment>>("MatchComment", matchCommentSchema),
    matches: connection.model<Persisted<Match>>("Match", matchSchema),
    tournaments: connection.model<Persisted<Tournament>>("Tournament", tournamentSchema),
    venues: connection.model<Persisted<Venue>>("Venue", venueSchema),
    invites: connection.model<Persisted<Invite>>("Invite", inviteSchema),
    notifications: connection.model<Persisted<Notification>>("Notification", notificationSchema),
    sessions: connection.model<Persisted<SessionRecord>>("Session", sessionSchema),
    auditLogs: connection.model<Persisted<AuditLog>>("AuditLog", auditLogSchema),
    playerFeatureSnapshots: connection.model<Persisted<PlayerFeatureSnapshot & { id: string }>>("PlayerFeatureSnapshot", playerFeatureSnapshotSchema),
    playerCardProjections: connection.model<Persisted<PlayerCardProjection>>("PlayerCardProjection", playerCardProjectionSchema)
  };
};

class BaseMongooseRepository<T extends { id: string }> {
  constructor(protected readonly model: Model<Persisted<T>>) {}

  protected async save(item: T): Promise<T> {
    const { id, ...rest } = item;
    await this.model.updateOne({ _id: id }, { $set: { ...rest, _id: id } }, { upsert: true, runValidators: true });
    return item;
  }
}

class MongooseUserRepository implements UserRepository {
  constructor(private readonly model: Model<Persisted<StoredUser>>) {}

  async create(input: StoredUser): Promise<StoredUser> {
    const { id, ...rest } = input;
    await this.model.create({ ...rest, _id: id });
    return input;
  }

  async update(user: StoredUser): Promise<StoredUser> {
    const { id, ...rest } = user;
    await this.model.updateOne({ _id: id }, { $set: { ...rest, _id: id } }, { runValidators: true });
    return user;
  }

  async findById(id: string): Promise<StoredUser | null> {
    return toDomain<StoredUser>(await this.model.findById(id).lean());
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return toDomain<StoredUser>(
      await this.model.findOne({ email: email.trim() }).collation({ locale: "en", strength: 2 }).lean()
    );
  }

  async findByUsername(username: string): Promise<StoredUser | null> {
    return toDomain<StoredUser>(
      await this.model.findOne({ username: username.trim() }).collation({ locale: "en", strength: 2 }).lean()
    );
  }
}

class MongoosePlayerProfileRepository implements PlayerProfileRepository {
  constructor(private readonly model: Model<Persisted<PlayerProfile>>) {}

  async upsert(profile: PlayerProfile): Promise<PlayerProfile> {
    const optionalFields = ["shirtNumber", "photoUrl", "photoMetadata", "primaryTeamId", "teamName", "bio"] as const;
    const unset = Object.fromEntries(optionalFields.filter((field) => !(field in profile)).map((field) => [field, 1]));

    await this.model.updateOne(
      { _id: profile.userId },
      { $set: { ...profile, _id: profile.userId }, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { upsert: true, runValidators: true }
    );
    return profile;
  }

  async findByUserId(userId: string): Promise<PlayerProfile | null> {
    const doc = await this.model.findById(userId).lean();

    if (!doc) {
      return null;
    }

    const { _id: _ignored, ...rest } = clean(doc);
    return rest as PlayerProfile;
  }

  async listByUserIds(userIds: string[]): Promise<PlayerProfile[]> {
    return (await this.model.find({ _id: { $in: userIds } }).lean()).map((doc) => {
      const { _id: _ignored, ...rest } = clean(doc);
      return rest as PlayerProfile;
    });
  }
}

class MongoosePlayerFeatureSnapshotRepository extends BaseMongooseRepository<PlayerFeatureSnapshot & { id: string }> implements PlayerFeatureSnapshotRepository {
  async create(snapshot: PlayerFeatureSnapshot & { id: string }): Promise<PlayerFeatureSnapshot & { id: string }> {
    return this.save(snapshot);
  }

  async findLatest(playerId: string, filters: { teamId?: string; tournamentId?: string } = {}): Promise<(PlayerFeatureSnapshot & { id: string }) | null> {
    const query = {
      playerId,
      ...(filters.teamId ? { teamId: filters.teamId } : {}),
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {})
    };
    const snapshot = await this.model.findOne(query).sort({ createdAt: -1 }).lean();
    return snapshot ? toDomain<PlayerFeatureSnapshot & { id: string }>(snapshot) : null;
  }

  async listByPlayer(playerId: string, filters: { teamId?: string; tournamentId?: string; limit?: number } = {}): Promise<Array<PlayerFeatureSnapshot & { id: string }>> {
    const query = {
      playerId,
      ...(filters.teamId ? { teamId: filters.teamId } : {}),
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {})
    };

    return (await this.model.find(query).sort({ createdAt: -1 }).limit(filters.limit ?? 20).lean())
      .map((doc) => toDomain<PlayerFeatureSnapshot & { id: string }>(doc))
      .filter(Boolean) as Array<PlayerFeatureSnapshot & { id: string }>;
  }
}

class MongoosePlayerCardProjectionRepository implements PlayerCardProjectionRepository {
  constructor(private readonly model: Model<Persisted<PlayerCardProjection>>) {}

  async upsert(projection: PlayerCardProjection): Promise<PlayerCardProjection> {
    await this.model.updateOne({ _id: projection.playerId }, { $set: { ...projection, _id: projection.playerId } }, { upsert: true, runValidators: true });
    return projection;
  }

  async findByPlayerId(playerId: string): Promise<PlayerCardProjection | null> {
    const projection = await this.model.findById(playerId).lean();
    if (!projection) return null;
    const { _id: _ignored, ...rest } = clean(projection);
    return rest as PlayerCardProjection;
  }

  async listByPlayerIds(playerIds: string[]): Promise<PlayerCardProjection[]> {
    return (await this.model.find({ _id: { $in: playerIds } }).lean()).map((projection) => {
      const { _id: _ignored, ...rest } = clean(projection);
      return rest as PlayerCardProjection;
    });
  }
}

class MongooseTeamJoinRequestRepository extends BaseMongooseRepository<TeamJoinRequest> implements TeamJoinRequestRepository {
  async create(request: TeamJoinRequest): Promise<TeamJoinRequest> { return this.save(request); }
  async update(request: TeamJoinRequest): Promise<TeamJoinRequest> { return this.save(request); }
  async findById(id: string): Promise<TeamJoinRequest | null> { return toDomain<TeamJoinRequest>(await this.model.findById(id).lean()); }
  async findByTeamAndUser(teamId: string, userId: string): Promise<TeamJoinRequest | null> { return toDomain<TeamJoinRequest>(await this.model.findOne({ teamId, userId, status: "pending" }).lean()); }
  async listByTeam(teamId: string): Promise<TeamJoinRequest[]> { return (await this.model.find({ teamId }).sort({ requestedAt: -1 }).lean()).map((doc) => toDomain<TeamJoinRequest>(doc)).filter(Boolean) as TeamJoinRequest[]; }
}

class MongooseMatchJoinRequestRepository extends BaseMongooseRepository<MatchJoinRequest> implements MatchJoinRequestRepository {
  async create(request: MatchJoinRequest): Promise<MatchJoinRequest> { return this.save(request); }
  async update(request: MatchJoinRequest): Promise<MatchJoinRequest> { return this.save(request); }
  async findById(id: string): Promise<MatchJoinRequest | null> { return toDomain<MatchJoinRequest>(await this.model.findById(id).lean()); }
  async findByMatchAndUser(matchId: string, userId: string): Promise<MatchJoinRequest | null> { return toDomain<MatchJoinRequest>(await this.model.findOne({ matchId, userId, status: "pending" }).lean()); }
  async listByMatch(matchId: string): Promise<MatchJoinRequest[]> { return (await this.model.find({ matchId }).sort({ requestedAt: -1 }).lean()).map((doc) => toDomain<MatchJoinRequest>(doc)).filter(Boolean) as MatchJoinRequest[]; }
}

class MongooseTeamMessageRepository extends BaseMongooseRepository<TeamMessage> implements TeamMessageRepository {
  async create(message: TeamMessage): Promise<TeamMessage> { return this.save(message); }
  async findById(id: string): Promise<TeamMessage | null> { return toDomain<TeamMessage>(await this.model.findById(id).lean()); }
  async listByTeam(teamId: string, page: number, pageSize: number): Promise<TeamMessage[]> { return (await this.model.find({ teamId }).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean()).map((doc) => toDomain<TeamMessage>(doc)).filter(Boolean) as TeamMessage[]; }
  async deleteById(id: string): Promise<void> { await this.model.deleteOne({ _id: id }); }
}

class MongooseMatchCommentRepository extends BaseMongooseRepository<MatchComment> implements MatchCommentRepository {
  async create(comment: MatchComment): Promise<MatchComment> { return this.save(comment); }
  async findById(id: string): Promise<MatchComment | null> { return toDomain<MatchComment>(await this.model.findById(id).lean()); }
  async listByMatch(matchId: string, page: number, pageSize: number): Promise<MatchComment[]> { return (await this.model.find({ matchId }).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean()).map((doc) => toDomain<MatchComment>(doc)).filter(Boolean) as MatchComment[]; }
  async deleteById(id: string): Promise<void> { await this.model.deleteOne({ _id: id }); }
}

class MongooseTeamRepository extends BaseMongooseRepository<Team> implements TeamRepository {
  async create(team: Team): Promise<Team> {
    return this.save(team);
  }

  async update(team: Team): Promise<Team> {
    const { id, ...rest } = team;
    const unset = Object.fromEntries(["description", "logoUrl", "logoMetadata", "city", "state", "latitude", "longitude"].filter((field) => team[field as keyof Team] === undefined).map((field) => [field, 1]));
    await this.model.updateOne({ _id: id }, { $set: { ...rest, _id: id }, ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { upsert: true, runValidators: true });
    return team;
  }

  async findById(id: string): Promise<Team | null> {
    return toDomain<Team>(await this.model.findById(id).lean());
  }

  async listByMember(userId: string): Promise<Team[]> {
    return (await this.model.find({ "members.userId": userId }).lean()).map((doc) => toDomain<Team>(doc)).filter(Boolean) as Team[];
  }

  async listVisibleToUser(userId: string): Promise<Team[]> {
    return (await this.model.find({ $or: [{ visibility: "public" }, { "members.userId": userId }] }).lean())
      .map((doc) => toDomain<Team>(doc))
      .filter(Boolean) as Team[];
  }

  async listByIds(ids: string[]): Promise<Team[]> {
    return (await this.model.find({ _id: { $in: ids } }).lean()).map((doc) => toDomain<Team>(doc)).filter(Boolean) as Team[];
  }
}

class MongooseMatchRepository extends BaseMongooseRepository<Match> implements MatchRepository {
  async create(match: Match): Promise<Match> {
    return this.save(match);
  }

  async update(match: Match): Promise<Match> {
    return this.save(match);
  }

  async findById(id: string): Promise<Match | null> {
    return toDomain<Match>(await this.model.findById(id).lean());
  }

  async listAll(): Promise<Match[]> {
    return (await this.model.find().sort({ playedAt: -1 }).lean()).map((doc) => toDomain<Match>(doc)).filter(Boolean) as Match[];
  }

  async listByTeamIds(teamIds: string[]): Promise<Match[]> {
    return (await this.model.find({ $or: [{ "home.teamId": { $in: teamIds } }, { "away.teamId": { $in: teamIds } }] }).lean())
      .map((doc) => toDomain<Match>(doc))
      .filter(Boolean) as Match[];
  }

  async listByPlayerId(playerId: string): Promise<Match[]> {
    return (await this.model.find({ $or: [{ "home.playerIds": playerId }, { "away.playerIds": playerId }] }).lean())
      .map((doc) => toDomain<Match>(doc))
      .filter(Boolean) as Match[];
  }

  async listByTournamentId(tournamentId: string): Promise<Match[]> {
    return (await this.model.find({ tournamentId }).lean()).map((doc) => toDomain<Match>(doc)).filter(Boolean) as Match[];
  }
}

class MongooseTournamentRepository extends BaseMongooseRepository<Tournament> implements TournamentRepository {
  async create(tournament: Tournament): Promise<Tournament> {
    return this.save(tournament);
  }

  async update(tournament: Tournament): Promise<Tournament> {
    return this.save(tournament);
  }

  async findById(id: string): Promise<Tournament | null> {
    return toDomain<Tournament>(await this.model.findById(id).lean());
  }

  async listByOwnerOrTeam(userId: string, teamIds: string[]): Promise<Tournament[]> {
    return (await this.model.find({ $or: [{ visibility: "public" }, { ownerId: userId }, { teamIds: { $in: teamIds } }] }).lean())
      .map((doc) => toDomain<Tournament>(doc))
      .filter(Boolean) as Tournament[];
  }
}

class MongooseVenueRepository extends BaseMongooseRepository<Venue> implements VenueRepository {
  async create(venue: Venue): Promise<Venue> {
    return this.save(venue);
  }

  async update(venue: Venue): Promise<Venue> {
    return this.save(venue);
  }

  async findById(id: string): Promise<Venue | null> {
    return toDomain<Venue>(await this.model.findById(id).lean());
  }

  async listVisibleToUser(
    userId: string,
    filters: { city?: string; state?: string; visibility?: Venue["visibility"]; page?: number; pageSize?: number } = {}
  ): Promise<Venue[]> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const query: Record<string, unknown> = {
      $and: [
        { $or: [{ visibility: "public" }, { ownerId: userId }] },
        ...(filters.visibility ? [{ visibility: filters.visibility }] : []),
        ...(filters.city ? [{ city: filters.city }] : []),
        ...(filters.state ? [{ state: filters.state }] : [])
      ]
    };

    return (await this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean())
      .map((doc) => toDomain<Venue>(doc))
      .filter(Boolean) as Venue[];
  }
}

class MongooseInviteRepository extends BaseMongooseRepository<Invite> implements InviteRepository {
  async create(invite: Invite): Promise<Invite> {
    return this.save(invite);
  }

  async update(invite: Invite): Promise<Invite> {
    return this.save(invite);
  }

  async findById(id: string): Promise<Invite | null> {
    return toDomain<Invite>(await this.model.findById(id).lean());
  }

  async findByToken(token: string): Promise<Invite | null> {
    return toDomain<Invite>(await this.model.findOne({ token }).lean());
  }

  async findPendingByEmail(email: string): Promise<Invite[]> {
    return (await this.model.find({ email, status: "pending" }).lean()).map((doc) => toDomain<Invite>(doc)).filter(Boolean) as Invite[];
  }

  async listByResource(resourceType: "team" | "tournament", resourceId: string): Promise<Invite[]> {
    return (await this.model.find({ resourceType, resourceId }).lean()).map((doc) => toDomain<Invite>(doc)).filter(Boolean) as Invite[];
  }
}

class MongooseNotificationRepository extends BaseMongooseRepository<Notification> implements NotificationRepository {
  async create(notification: Notification): Promise<Notification> {
    return this.save(notification);
  }

  async findById(id: string): Promise<Notification | null> {
    return toDomain<Notification>(await this.model.findById(id).lean());
  }

  async listByUser(userId: string): Promise<Notification[]> {
    return (await this.model.find({ userId }).sort({ createdAt: -1 }).lean()).map((doc) => toDomain<Notification>(doc)).filter(Boolean) as Notification[];
  }

  async markRead(id: string, userId: string, readAt: string): Promise<Notification | null> {
    const doc = await this.model.findOneAndUpdate({ _id: id, userId }, { $set: { readAt } }, { new: true, runValidators: true }).lean();
    return toDomain<Notification>(doc);
  }

  async markAllRead(userId: string, readAt: string): Promise<void> {
    await this.model.updateMany({ userId, readAt: { $exists: false } }, { $set: { readAt } }, { runValidators: true });
  }
}

class MongooseSessionRepository extends BaseMongooseRepository<SessionRecord> implements SessionRepository {
  async create(session: SessionRecord): Promise<SessionRecord> {
    const { id, ...rest } = session;
    await this.model.create({ ...rest, _id: id });
    return session;
  }

  async findById(id: string): Promise<SessionRecord | null> {
    const doc = await this.model.findById(id).lean();
    const session = toDomain<SessionRecord>(doc);

    if (!session) {
      return null;
    }

    return {
      ...session,
      expiresAt: new Date(session.expiresAt).toISOString()
    };
  }

  async listByUser(userId: string): Promise<SessionRecord[]> {
    return (await this.model.find({ userId }).sort({ createdAt: -1 }).lean())
      .map((doc) => toDomain<SessionRecord>(doc))
      .filter(Boolean) as SessionRecord[];
  }

  async update(session: SessionRecord): Promise<SessionRecord> {
    return this.save(session);
  }

  async revokeById(id: string, userId: string, revokedAt: string): Promise<SessionRecord | null> {
    const doc = await this.model.findOneAndUpdate({ _id: id, userId }, { $set: { revokedAt } }, { new: true, runValidators: true }).lean();
    return toDomain<SessionRecord>(doc);
  }

  async revokeAllByUser(userId: string, revokedAt: string, exceptSessionId?: string): Promise<void> {
    await this.model.updateMany(
      { userId, ...(exceptSessionId ? { _id: { $ne: exceptSessionId } } : {}), revokedAt: { $exists: false } },
      { $set: { revokedAt } },
      { runValidators: true }
    );
  }

  async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}

class MongooseAuditLogRepository extends BaseMongooseRepository<AuditLog> implements AuditLogRepository {
  async create(auditLog: AuditLog): Promise<AuditLog> {
    return this.save(auditLog);
  }

  async listByActor(actorUserId: string): Promise<AuditLog[]> {
    return (await this.model.find({ actorUserId }).sort({ createdAt: -1 }).lean())
      .map((doc) => toDomain<AuditLog>(doc))
      .filter(Boolean) as AuditLog[];
  }
}

export interface MongoPersistence {
  client: Connection;
  repositories: Repositories;
}

export const createMongoRepositories = async (uri: string, dbName: string): Promise<MongoPersistence> => {
  const connection = await mongoose.createConnection(uri, { dbName }).asPromise();
  const models = modelsFor(connection);
  await connection.syncIndexes();

  return {
    client: connection,
    repositories: {
      users: new MongooseUserRepository(models.users),
      playerProfiles: new MongoosePlayerProfileRepository(models.playerProfiles),
      playerFeatureSnapshots: new MongoosePlayerFeatureSnapshotRepository(models.playerFeatureSnapshots),
      playerCardProjections: new MongoosePlayerCardProjectionRepository(models.playerCardProjections),
      teams: new MongooseTeamRepository(models.teams),
      teamJoinRequests: new MongooseTeamJoinRequestRepository(models.teamJoinRequests),
      matchJoinRequests: new MongooseMatchJoinRequestRepository(models.matchJoinRequests),
      teamMessages: new MongooseTeamMessageRepository(models.teamMessages),
      matchComments: new MongooseMatchCommentRepository(models.matchComments),
      matches: new MongooseMatchRepository(models.matches),
      tournaments: new MongooseTournamentRepository(models.tournaments),
      venues: new MongooseVenueRepository(models.venues),
      invites: new MongooseInviteRepository(models.invites),
      notifications: new MongooseNotificationRepository(models.notifications),
      auditLogs: new MongooseAuditLogRepository(models.auditLogs),
      sessions: new MongooseSessionRepository(models.sessions)
    }
  };
};
