import { z } from "zod";

export const localeSchema = z.enum(["pt-BR", "en"]);
export const themeSchema = z.enum(["light", "dark", "system"]);
export const platformRoleSchema = z.enum(["user", "admin"]);
export const roleSchema = z.enum(["owner", "admin", "captain", "member", "guest"]);
export const preferredFootSchema = z.enum(["right", "left", "both"]);
const canonicalPlayerPositionSchema = z.enum([
  "goalkeeper", "right-back", "center-back", "left-back", "defensive-midfielder", "central-midfielder", "attacking-midfielder", "right-winger", "left-winger", "striker"
]);
const legacyPositionMap: Record<string, z.infer<typeof canonicalPlayerPositionSchema>> = {
  defender: "center-back",
  midfielder: "central-midfielder",
  forward: "striker"
};
export const playerPositionSchema = z.preprocess(
  (value) => typeof value === "string" ? (legacyPositionMap[value] ?? value) : value,
  canonicalPlayerPositionSchema
);
export const matchTypeSchema = z.enum(["casual", "tournament"]);
export const matchStatusSchema = z.enum(["scheduled", "confirming", "completed", "cancelled"]);
export const inviteRoleSchema = z.enum(["admin", "captain", "member"]);
export const teamJoinPolicySchema = z.enum(["closed", "request"]);
export const requestStatusSchema = z.enum(["pending", "approved", "rejected", "cancelled"]);
export const matchParticipationPolicySchema = z.enum(["closed", "request"]);
export const inviteStatusSchema = z.enum(["pending", "accepted", "revoked"]);
export const entityVisibilitySchema = z.enum(["private", "public"]);
export const notificationTypeSchema = z.enum([
  "invite-created",
  "invite-accepted",
  "match-scheduled",
  "match-completed",
  "match-cancelled",
  "presence-updated",
  "team-member-added",
  "tournament-updated"
]);
export const presenceStatusSchema = z.enum(["pending", "confirmed", "declined", "maybe"]);
export const ratingVersionSchema = z.enum(["v1", "v2"]);
export const matchReviewStatusSchema = z.enum(["none", "pending", "approved", "disputed"]);
export const usernameSchema = z.string().min(3).max(20).regex(/^[A-Za-z0-9_]+$/);
export const publicIdentifierSchema = z.preprocess(
  (value) => typeof value === "string" ? value.trim().toUpperCase() : value,
  z.string().regex(/^#[0-9A-F]{6}$/)
);
export const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-zA-Z]/, "A senha precisa ter pelo menos uma letra.")
  .regex(/[0-9]/, "A senha precisa ter pelo menos um numero.");
export const photoUrlSchema = z.union([
  z.url().max(500),
  z.string().regex(/^\/uploads\/[a-zA-Z0-9-]+\.(jpg|png|webp)$/).max(500)
]);

export const statsSchema = z.object({
  matchesPlayed: z.number().int().nonnegative(),
  wins: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  goals: z.number().int().nonnegative(),
  assists: z.number().int().nonnegative(),
  saves: z.number().int().nonnegative().default(0),
  cleanSheets: z.number().int().nonnegative(),
  goalDifference: z.number().int(),
  points: z.number().int().nonnegative(),
  winRate: z.number().nonnegative(),
  goalsPerMatch: z.number().nonnegative(),
  form: z.array(z.enum(["W", "D", "L"])),
  recentHighlight: z.string()
});

export const publicUserSchema = z.object({
  id: z.string(),
  publicIdentifier: publicIdentifierSchema,
  email: z.email(),
  username: usernameSchema,
  locale: localeSchema,
  theme: themeSchema,
  providers: z.array(z.enum(["credentials", "google"])),
  platformRole: platformRoleSchema.default("user")
});

export const starRatingSchema = z.number().int().min(1).max(5);
export const outfieldAttributesSchema = z.object({
  pac: starRatingSchema,
  sho: starRatingSchema,
  pas: starRatingSchema,
  dri: starRatingSchema,
  def: starRatingSchema,
  phy: starRatingSchema
});
export const goalkeeperAttributesSchema = z.object({
  div: starRatingSchema,
  han: starRatingSchema,
  kic: starRatingSchema,
  ref: starRatingSchema,
  spd: starRatingSchema,
  pos: starRatingSchema
});
export const athleteSkillsInputSchema = z.object({
  outfield: outfieldAttributesSchema,
  isGoalkeeper: z.boolean(),
  goalkeeper: goalkeeperAttributesSchema.optional()
}).superRefine((value, context) => {
  if (value.isGoalkeeper && !value.goalkeeper) {
    context.addIssue({ code: "custom", path: ["goalkeeper"], message: "Informe os atributos de goleiro." });
  }
  if (!value.isGoalkeeper && value.goalkeeper) {
    context.addIssue({ code: "custom", path: ["goalkeeper"], message: "Atributos de goleiro exigem a marcacao de goleiro." });
  }
});
export const athleteSkillProfileSchema = z.object({
  userId: z.string(),
  outfield: outfieldAttributesSchema,
  isGoalkeeper: z.boolean(),
  goalkeeper: goalkeeperAttributesSchema.optional(),
  completedAt: z.string(),
  updatedAt: z.string()
});
export const teamAthleteSkillOverrideSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  userId: z.string(),
  outfield: outfieldAttributesSchema,
  isGoalkeeper: z.boolean(),
  goalkeeper: goalkeeperAttributesSchema.optional(),
  updatedBy: z.string(),
  updatedAt: z.string()
});
export const teamAthleteSchema = z.object({
  userId: z.string(),
  username: usernameSchema.optional(),
  displayName: z.string(),
  role: roleSchema,
  skills: athleteSkillProfileSchema.optional(),
  effectiveSkills: athleteSkillProfileSchema.optional(),
  skillOverride: teamAthleteSkillOverrideSchema.optional(),
  skillOverrideByName: z.string().optional(),
  hasSkillOverride: z.boolean()
});

export const playerProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string().min(2).max(40),
  shirtNumber: z.number().int().positive().max(99).optional(),
  photoUrl: photoUrlSchema.optional(),
  photoMetadata: z.object({
    fileName: z.string(),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    size: z.number().int().positive(),
    uploadedAt: z.string()
  }).optional(),
  primaryTeamId: z.string().optional(),
  teamName: z.string().min(2).max(40).optional(),
  preferredFoot: preferredFootSchema,
  preferredPosition: playerPositionSchema,
  bio: z.string().max(160).optional(),
  stats: statsSchema
});

export const membershipSchema = z.object({
  userId: z.string(),
  username: usernameSchema.optional(),
  role: roleSchema,
  joinedAt: z.string()
});

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  ownerId: z.string(),
  visibility: entityVisibilitySchema.default("private"),
  joinPolicy: teamJoinPolicySchema.default("closed"),
  description: z.string().max(240).optional(),
  logoUrl: photoUrlSchema.optional(),
  logoMetadata: z.object({ fileName: z.string(), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]), size: z.number().int().positive(), uploadedAt: z.string() }).optional(),
  city: z.string().min(2).max(80).optional(),
  state: z.string().min(2).max(2).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  members: z.array(membershipSchema),
  stats: statsSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export const matchEventSchema = z.object({
  minute: z.number().int().min(0).max(130),
  type: z.enum(["goal", "assist", "yellow-card", "red-card"]),
  playerId: z.string(),
  teamId: z.string(),
  assistPlayerId: z.string().optional()
});

export const matchVenueSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  address: z.string().min(2).max(120).optional(),
  city: z.string().min(2).max(80).optional(),
  state: z.string().min(2).max(2).optional(),
  surface: z.enum(["grass", "synthetic", "court", "sand", "other"]).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const matchPresenceSchema = z.object({
  userId: z.string(),
  status: presenceStatusSchema,
  updatedAt: z.string(),
  updatedBy: z.string()
});

export const matchLineupSchema = z.object({
  homePlayerIds: z.array(z.string()).min(1),
  awayPlayerIds: z.array(z.string()).min(1),
  updatedAt: z.string(),
  updatedBy: z.string()
});

export const matchCheckInSchema = z.object({
  userId: z.string(),
  checkedInAt: z.string()
});

export const venueSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(80),
  slug: z.string(),
  ownerId: z.string(),
  visibility: entityVisibilitySchema,
  address: z.string().min(2).max(180).optional(),
  postalCode: z.string().regex(/^\d{5}-?\d{3}$/).optional(),
  addressNumber: z.string().trim().min(1).max(20).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(2),
  surface: z.enum(["grass", "synthetic", "court", "sand", "other"]),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  contactPhone: z.string().min(8).max(24).optional(),
  prices: z.object({
    minutes60: z.number().int().nonnegative(),
    minutes90: z.number().int().nonnegative(),
    minutes120: z.number().int().nonnegative()
  }).optional(),
  status: z.enum(["active", "closed"]).default("active"),
  ratingAverage: z.number().min(0).max(5).default(0),
  ratingCount: z.number().int().nonnegative().default(0),
  approvedAt: z.string().optional(),
  approvedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const moderationStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const venueChangeKindSchema = z.enum(["create", "update", "close", "reopen"]);
export const venuePricesSchema = z.object({
  minutes60: z.number().int().nonnegative(),
  minutes90: z.number().int().nonnegative(),
  minutes120: z.number().int().nonnegative()
});
export const venueChangeSetSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  visibility: entityVisibilitySchema.optional(),
  address: z.string().trim().min(2).max(180).optional(),
  postalCode: z.string().trim().regex(/^\d{5}-?\d{3}$/).optional(),
  addressNumber: z.string().trim().min(1).max(20).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  state: z.string().trim().length(2).optional(),
  surface: z.enum(["grass", "synthetic", "court", "sand", "other"]).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  contactPhone: z.string().trim().min(8).max(24).optional(),
  prices: venuePricesSchema.optional()
});
export const venueChangeRequestSchema = z.object({
  id: z.string(),
  venueId: z.string().optional(),
  kind: venueChangeKindSchema,
  changes: venueChangeSetSchema,
  status: moderationStatusSchema,
  submittedBy: z.string(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewReason: z.string().max(240).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});
export const venueReviewSchema = z.object({
  id: z.string(),
  venueId: z.string(),
  authorId: z.string(),
  rating: starRatingSchema,
  comment: z.string().trim().max(500).optional(),
  status: moderationStatusSchema,
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewReason: z.string().max(240).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const matchSideSchema = z.object({
  teamId: z.string(),
  score: z.number().int().nonnegative(),
  playerIds: z.array(z.string()).min(1)
});

export const matchSchema = z.object({
  id: z.string(),
  type: matchTypeSchema,
  status: matchStatusSchema,
  createdBy: z.string(),
  participationPolicy: matchParticipationPolicySchema.default("closed"),
  slotsPerSide: z.number().int().positive().max(30).optional(),
  home: matchSideSchema,
  away: matchSideSchema,
  eventLog: z.array(matchEventSchema),
  presences: z.array(matchPresenceSchema).default([]),
  lineup: matchLineupSchema.optional(),
  checkIns: z.array(matchCheckInSchema).default([]),
  reviewStatus: matchReviewStatusSchema.default("none"),
  eventLogVersion: z.number().int().positive().default(1),
  durationMinutes: z.number().int().positive().max(180).optional(),
  venueId: z.string().optional(),
  venue: matchVenueSchema.optional(),
  tournamentId: z.string().optional(),
  cancelledAt: z.string().optional(),
  cancelledBy: z.string().optional(),
  cancelReason: z.string().max(180).optional(),
  playedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const tournamentStandingSchema = z.object({
  teamId: z.string(),
  stats: statsSchema
});

export const tournamentRoundPairingSchema = z.object({
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  matchId: z.string().optional()
});

export const tournamentRoundSchema = z.object({
  round: z.number().int().positive(),
  pairings: z.array(tournamentRoundPairingSchema),
  createdAt: z.string()
});

export const tournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  ownerId: z.string(),
  format: z.enum(["league"]),
  visibility: entityVisibilitySchema.default("private"),
  teamIds: z.array(z.string()),
  matchIds: z.array(z.string()),
  rounds: z.array(tournamentRoundSchema).default([]),
  standings: z.array(tournamentStandingSchema),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const inviteSchema = z.object({
  id: z.string(),
  resourceType: z.enum(["team", "tournament"]),
  resourceId: z.string(),
  recipientUserId: z.string().optional(),
  recipientPublicIdentifier: publicIdentifierSchema.optional(),
  email: z.email().optional(),
  role: inviteRoleSchema,
  status: inviteStatusSchema,
  invitedBy: z.string(),
  token: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string()
});

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: notificationTypeSchema,
  title: z.string().min(2).max(100),
  message: z.string().min(2).max(240),
  metadata: z.record(z.string(), z.string()).optional(),
  readAt: z.string().optional(),
  createdAt: z.string()
});

export const auditLogSchema = z.object({
  id: z.string(),
  actorUserId: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
  createdAt: z.string()
});

export const playerCardRatingsSchema = z.object({
  ratingVersion: ratingVersionSchema,
  overall: z.number().int().min(35).max(99),
  attack: z.number().int().min(35).max(99),
  pass: z.number().int().min(35).max(99),
  presence: z.number().int().min(35).max(99),
  regularity: z.number().int().min(35).max(99),
  winning: z.number().int().min(35).max(99),
  form: z.number().int().min(35).max(99)
});

export const playerFeatureSnapshotSchema = z.object({
  id: z.string().optional(),
  playerId: z.string(),
  ratingVersion: ratingVersionSchema,
  teamId: z.string().optional(),
  tournamentId: z.string().optional(),
  matchesPlayed: z.number().int().nonnegative(),
  goalsPerMatch: z.number().nonnegative(),
  assistsPerMatch: z.number().nonnegative(),
  presenceRate: z.number().nonnegative(),
  checkInRate: z.number().nonnegative().optional(),
  winRate: z.number().nonnegative(),
  recentFormScore: z.number().nonnegative(),
  impactScore: z.number().optional(),
  createdAt: z.string()
});

export const playerCardV2FactorSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  weight: z.number()
});

export const playerCardV2Schema = z.object({
  playerId: z.string(),
  ratingVersion: z.literal("v2"),
  score: z.number().int().min(35).max(99),
  factors: z.array(playerCardV2FactorSchema),
  explanation: z.string(),
  snapshot: playerFeatureSnapshotSchema
});

export const playerInsightSchema = z.object({
  type: z.enum(["strength", "opportunity", "trend"]),
  title: z.string(),
  message: z.string(),
  scoreImpact: z.number()
});

export const statsImpactSchema = z.object({
  matchId: z.string(),
  playerImpacts: z.array(z.object({
    playerId: z.string(),
    goals: z.number().int().nonnegative(),
    assists: z.number().int().nonnegative(),
    checkedIn: z.boolean(),
    impactScore: z.number()
  })),
  teamImpacts: z.array(z.object({
    teamId: z.string(),
    pointsDelta: z.number().int(),
    goalDifferenceDelta: z.number().int()
  }))
});

export const playerRankingEntrySchema = z.object({
  playerId: z.string(),
  displayName: z.string(),
  stats: statsSchema,
  ratings: playerCardRatingsSchema,
  rank: z.number().int().positive(),
  explanation: z.string()
});

export const signUpInputSchema = z.object({
  email: z.email(),
  username: usernameSchema,
  password: passwordSchema,
  locale: localeSchema.default("pt-BR")
});

export const signInInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
  rememberMe: z.boolean().default(false)
});

export const googleAuthInputSchema = z.object({
  credential: z.string().min(1),
  locale: localeSchema.default("pt-BR"),
  rememberMe: z.boolean().default(false)
});

export const updateProfileInputSchema = z.object({
  displayName: z.string().trim().min(2).max(40),
  shirtNumber: z.number().int().positive().max(99).nullable().optional(),
  photoUrl: photoUrlSchema.nullable().optional(),
  primaryTeamId: z.string().nullable().optional(),
  preferredFoot: preferredFootSchema,
  preferredPosition: playerPositionSchema,
  bio: z.string().trim().max(160).nullable().optional()
});

export const teamJoinRequestSchema = z.object({ id: z.string(), teamId: z.string(), userId: z.string(), status: requestStatusSchema, requestedAt: z.string(), reviewedAt: z.string().optional(), reviewedBy: z.string().optional() });
export const matchJoinRequestSchema = z.object({ id: z.string(), matchId: z.string(), userId: z.string(), status: requestStatusSchema, side: z.enum(["home", "away"]).optional(), requestedAt: z.string(), reviewedAt: z.string().optional(), reviewedBy: z.string().optional() });
export const teamMessageSchema = z.object({ id: z.string(), teamId: z.string(), authorId: z.string(), text: z.string().min(1).max(1000), createdAt: z.string() });
export const matchCommentSchema = z.object({ id: z.string(), matchId: z.string(), authorId: z.string(), text: z.string().min(1).max(1000), createdAt: z.string() });

export const playerCardFactorKeySchema = z.enum([
  "matches",
  "goalsPerMatch",
  "assistsPerMatch",
  "saves",
  "cleanSheets",
  "attendance",
  "checkIn",
  "winRate",
  "form",
  "impact"
]);

export const playerCardProjectionSchema = z.object({
  playerId: z.string(),
  ratingVersion: z.literal("v3"),
  score: z.number().int().min(35).max(99),
  confidence: z.enum(["forming", "established"]),
  stats: statsSchema,
  factors: z.array(z.object({ key: playerCardFactorKeySchema, value: z.number().min(0).max(100), weight: z.number().positive() })),
  sourceSignature: z.string().min(1),
  updatedAt: z.string()
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const createTeamInputSchema = z.object({
  name: z.string().min(2).max(40),
  visibility: entityVisibilitySchema.default("private"),
  joinPolicy: teamJoinPolicySchema.default("closed"),
  description: z.string().trim().max(240).optional(),
  city: z.string().min(2).max(80).optional(),
  state: z.string().min(2).max(2).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const createInviteInputSchema = z.object({
  resourceType: z.enum(["team", "tournament"]),
  resourceId: z.string(),
  publicIdentifier: publicIdentifierSchema,
  role: inviteRoleSchema
});

export const createMatchInputSchema = z.object({
  type: matchTypeSchema,
  home: matchSideSchema,
  away: matchSideSchema,
  tournamentId: z.string().optional(),
  durationMinutes: z.number().int().positive().max(180).optional(),
  venueId: z.string().optional(),
  venue: matchVenueSchema.optional(),
  participationPolicy: matchParticipationPolicySchema.default("closed"),
  slotsPerSide: z.number().int().positive().max(30).optional(),
  playedAt: z.string()
});

export const updateMembershipRoleInputSchema = z.object({ role: z.enum(["admin", "captain", "member"]) });
export const approveMatchJoinRequestInputSchema = z.object({ side: z.enum(["home", "away"]) });
export const createTextContentInputSchema = z.object({ text: z.string().trim().min(1).max(1000) });
export const listContentQuerySchema = z.object({ page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().positive().max(50).default(20) });
export const listTeamsQuerySchema = z.object({ scope: z.enum(["mine", "discover"]).default("mine"), q: z.string().trim().min(1).max(80).optional(), city: z.string().min(2).max(80).optional(), state: z.string().min(2).max(2).optional(), latitude: z.coerce.number().min(-90).max(90).optional(), longitude: z.coerce.number().min(-180).max(180).optional(), radiusKm: z.coerce.number().positive().max(500).default(30), page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().positive().max(50).default(20) });

export const completeMatchInputSchema = z.object({
  id: z.string(),
  homeScore: z.number().int().nonnegative(),
  awayScore: z.number().int().nonnegative(),
  durationMinutes: z.number().int().positive().max(180).optional(),
  venue: matchVenueSchema.optional(),
  eventLog: z.array(matchEventSchema)
});

export const updateMatchLineupInputSchema = z.object({
  homePlayerIds: z.array(z.string()).min(1),
  awayPlayerIds: z.array(z.string()).min(1)
});

export const reviewMatchInputSchema = z.object({
  homeScore: z.number().int().nonnegative(),
  awayScore: z.number().int().nonnegative(),
  durationMinutes: z.number().int().positive().max(180).optional(),
  venue: matchVenueSchema.optional(),
  eventLog: z.array(matchEventSchema),
  reason: z.string().max(240).optional()
});

export const updatePresenceInputSchema = z.object({
  status: presenceStatusSchema
});

export const cancelMatchInputSchema = z.object({
  reason: z.string().max(180).optional()
});

export const createTournamentInputSchema = z.object({
  name: z.string().min(2).max(50),
  visibility: entityVisibilitySchema.default("private"),
  teamIds: z.array(z.string()).min(2)
});

export const updateTournamentInputSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  visibility: entityVisibilitySchema.optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: "Informe ao menos um campo para atualizar."
});

export const updateTournamentTeamsInputSchema = z.object({
  teamIds: z.array(z.string()).min(1)
});

export const createVenueInputSchema = z.object({
  name: z.string().min(2).max(80),
  visibility: entityVisibilitySchema.default("private"),
  address: z.string().min(2).max(180),
  postalCode: z.string().trim().regex(/^\d{5}-?\d{3}$/),
  addressNumber: z.string().trim().min(1).max(20),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(2),
  surface: z.enum(["grass", "synthetic", "court", "sand", "other"]).default("other"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  contactPhone: z.string().trim().min(8).max(24),
  prices: venuePricesSchema
});

export const updateVenueInputSchema = createVenueInputSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Informe ao menos um campo para atualizar."
});

export const listVenuesQuerySchema = z.object({
  q: z.string().trim().min(1).max(80).optional(),
  city: z.string().min(2).max(80).optional(),
  state: z.string().min(2).max(2).optional(),
  visibility: entityVisibilitySchema.optional(),
  surface: z.enum(["grass", "synthetic", "court", "sand", "other"]).optional(),
  status: z.enum(["active", "closed"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20)
});

export const createVenueChangeRequestInputSchema = z.object({
  venueId: z.string().optional(),
  kind: venueChangeKindSchema,
  changes: venueChangeSetSchema
}).superRefine((value, context) => {
  if (value.kind === "create") {
    const required = ["name", "address", "postalCode", "addressNumber", "city", "state", "surface", "contactPhone", "prices"] as const;
    required.forEach((field) => {
      if (value.changes[field] === undefined) context.addIssue({ code: "custom", path: ["changes", field], message: "Campo obrigatorio." });
    });
    if (value.venueId) context.addIssue({ code: "custom", path: ["venueId"], message: "Cadastro novo nao recebe venueId." });
  } else if (!value.venueId) {
    context.addIssue({ code: "custom", path: ["venueId"], message: "Informe o campo existente." });
  }
});
export const venueReviewInputSchema = z.object({ rating: starRatingSchema, comment: z.string().trim().max(500).optional() });
export const moderationDecisionInputSchema = z.object({ decision: z.enum(["approve", "reject"]), reason: z.string().trim().max(240).optional() });

export const listMatchesQuerySchema = z.object({
  scope: z.enum(["mine", "nearby"]).default("mine"),
  q: z.string().trim().min(1).max(80).optional(),
  status: matchStatusSchema.optional(),
  teamId: z.string().optional(),
  tournamentId: z.string().optional(),
  city: z.string().trim().min(2).max(80).optional(),
  state: z.string().trim().min(2).max(2).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(100).default(25),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10)
});

export const locationReverseQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180)
});

export const locationSearchQuerySchema = z.object({
  q: z.string().trim().min(2).max(120),
  limit: z.coerce.number().int().positive().max(10).default(5)
});

export const playerRankingQuerySchema = z.object({
  teamId: z.string().optional(),
  tournamentId: z.string().optional(),
  period: z.enum(["all", "last-5", "last-10"]).default("all"),
  metric: z.enum(["overall", "goals", "assists", "presence", "winning", "form"]).default("overall")
});
