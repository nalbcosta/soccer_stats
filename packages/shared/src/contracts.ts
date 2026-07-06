import { z } from "zod";

export const localeSchema = z.enum(["pt-BR", "en"]);
export const themeSchema = z.enum(["light", "dark", "system"]);
export const roleSchema = z.enum(["owner", "admin", "member"]);
export const preferredFootSchema = z.enum(["right", "left", "both"]);
export const playerPositionSchema = z.enum(["goalkeeper", "defender", "midfielder", "forward"]);
export const matchTypeSchema = z.enum(["casual", "tournament"]);
export const matchStatusSchema = z.enum(["scheduled", "completed"]);
export const inviteRoleSchema = z.enum(["admin", "member"]);
export const inviteStatusSchema = z.enum(["pending", "accepted", "revoked"]);

export const statsSchema = z.object({
  matchesPlayed: z.number().int().nonnegative(),
  wins: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  goals: z.number().int().nonnegative(),
  assists: z.number().int().nonnegative(),
  saves: z.number().int().nonnegative(),
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
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
  locale: localeSchema,
  theme: themeSchema,
  providers: z.array(z.enum(["credentials", "google"]))
});

export const playerProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string().min(2).max(40),
  shirtNumber: z.number().int().positive().max(99).optional(),
  photoUrl: z.url().max(500).optional(),
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
  surface: z.enum(["grass", "synthetic", "court", "sand", "other"]).optional()
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
  durationMinutes: z.number().int().positive().max(180).optional(),
  venue: matchVenueSchema.optional(),
  tournamentId: z.string().optional(),
  playedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const tournamentStandingSchema = z.object({
  teamId: z.string(),
  stats: statsSchema
});

export const tournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  ownerId: z.string(),
  format: z.enum(["league"]),
  teamIds: z.array(z.string()),
  matchIds: z.array(z.string()),
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
  createdAt: z.string()
});

export const signUpInputSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
  password: z.string().min(8).max(72),
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
  displayName: z.string().min(2).max(40),
  shirtNumber: z.number().int().positive().max(99).optional(),
  photoUrl: z.url().max(500).optional(),
  teamName: z.string().min(2).max(40).optional(),
  preferredFoot: preferredFootSchema,
  preferredPosition: playerPositionSchema,
  bio: z.string().max(160).optional()
});

export const createTeamInputSchema = z.object({
  name: z.string().min(2).max(40)
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

export const createTournamentInputSchema = z.object({
  name: z.string().min(2).max(50),
  teamIds: z.array(z.string()).min(2)
});
