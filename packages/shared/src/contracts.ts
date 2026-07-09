import { z } from "zod";

export const localeSchema = z.enum(["pt-BR", "en"]);
export const themeSchema = z.enum(["light", "dark", "system"]);
export const roleSchema = z.enum(["owner", "admin", "member"]);
export const preferredFootSchema = z.enum(["right", "left", "both"]);
export const playerPositionSchema = z.enum(["goalkeeper", "defender", "midfielder", "forward"]);
export const matchTypeSchema = z.enum(["casual", "tournament"]);
export const matchStatusSchema = z.enum(["scheduled", "confirming", "completed", "cancelled"]);
export const inviteRoleSchema = z.enum(["admin", "member"]);
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
export const usernameSchema = z.string().min(3).max(20).regex(/^[a-z0-9_]+$/);
export const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-zA-Z]/, "A senha precisa ter pelo menos uma letra.")
  .regex(/[0-9]/, "A senha precisa ter pelo menos um numero.");

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
  email: z.email(),
  username: usernameSchema,
  locale: localeSchema,
  theme: themeSchema,
  providers: z.array(z.enum(["credentials", "google"]))
});

export const playerProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string().min(2).max(40),
  shirtNumber: z.number().int().positive().max(99).optional(),
  photoUrl: z.url().max(500).optional(),
  photoMetadata: z.object({
    fileName: z.string(),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    size: z.number().int().positive(),
    uploadedAt: z.string()
  }).optional(),
  teamName: z.string().min(2).max(40).optional(),
  preferredFoot: preferredFootSchema,
  preferredPosition: playerPositionSchema,
  bio: z.string().max(160).optional(),
  stats: statsSchema
});

export const membershipSchema = z.object({
  userId: z.string(),
  role: roleSchema,
  joinedAt: z.string()
});

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  ownerId: z.string(),
  visibility: entityVisibilitySchema.default("private"),
  city: z.string().min(2).max(80).optional(),
  state: z.string().min(2).max(2).optional(),
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
  address: z.string().min(2).max(120).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(2),
  surface: z.enum(["grass", "synthetic", "court", "sand", "other"]),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
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
  email: z.email(),
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

export const usernameAvailabilityQuerySchema = z.object({
  username: usernameSchema
});

export const googleAuthInputSchema = z.object({
  credential: z.string().min(1),
  locale: localeSchema.default("pt-BR"),
  rememberMe: z.boolean().default(false)
});

export const updateProfileInputSchema = z.object({
  displayName: z.string().min(2).max(40),
  shirtNumber: z.number().int().positive().max(99).optional(),
  photoUrl: z.url().max(500).optional(),
  teamName: z.string().min(2).max(40).optional(),
  preferredFoot: preferredFootSchema,
  preferredPosition: playerPositionSchema,
  bio: z.string().max(160).optional()
});

export const createTeamInputSchema = z.object({
  name: z.string().min(2).max(40),
  visibility: entityVisibilitySchema.default("private"),
  city: z.string().min(2).max(80).optional(),
  state: z.string().min(2).max(2).optional()
});

export const createInviteInputSchema = z.object({
  resourceType: z.enum(["team", "tournament"]),
  resourceId: z.string(),
  email: z.email(),
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
  playedAt: z.string()
});

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
  address: z.string().min(2).max(120).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(2),
  surface: z.enum(["grass", "synthetic", "court", "sand", "other"]).default("other"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const updateVenueInputSchema = createVenueInputSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Informe ao menos um campo para atualizar."
});

export const listVenuesQuerySchema = z.object({
  city: z.string().min(2).max(80).optional(),
  state: z.string().min(2).max(2).optional(),
  visibility: entityVisibilitySchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20)
});

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
