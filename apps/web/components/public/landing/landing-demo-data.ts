import type { AggregatedStats, Match, PlayerProfile, PublicUser, Team, Tournament } from "@soccer-stats/shared";

export const demoStats: AggregatedStats = {
  matchesPlayed: 24,
  wins: 15,
  draws: 4,
  losses: 5,
  goals: 31,
  assists: 12,
  saves: 0,
  cleanSheets: 0,
  goalDifference: 18,
  points: 49,
  winRate: 62.5,
  goalsPerMatch: 1.29,
  form: ["W", "W", "D", "W", "L"],
  recentHighlight: "Fase boa: decide jogo e ainda deixa assistência."
};

export const demoUser: PublicUser = {
  id: "demo-user",
  email: "leo10@nabola.app",
  username: "leo10",
  locale: "pt-BR",
  theme: "system",
  providers: ["credentials"]
};

export const demoAssistUser: PublicUser = {
  id: "demo-assist",
  email: "dudu7@nabola.app",
  username: "dudu7",
  locale: "pt-BR",
  theme: "system",
  providers: ["credentials"]
};

export const demoProfile: PlayerProfile = {
  userId: demoUser.id,
  displayName: "Léo Camisa 10",
  shirtNumber: 10,
  photoUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80",
  teamName: "Resenha FC",
  preferredFoot: "right",
  preferredPosition: "central-midfielder",
  bio: "Meia que gosta da bola no pé e da resenha organizada.",
  stats: demoStats
};

export const demoHomeTeam: Team = {
  id: "demo-home-team",
  name: "Azuis",
  slug: "azuis",
  ownerId: demoUser.id,
  visibility: "public",
  members: [
    { userId: demoUser.id, role: "owner", joinedAt: "2026-07-04T15:00:00.000Z" },
    { userId: demoAssistUser.id, role: "member", joinedAt: "2026-07-04T15:15:00.000Z" }
  ],
  stats: demoStats,
  createdAt: "2026-07-01T18:00:00.000Z",
  updatedAt: "2026-07-04T19:20:00.000Z"
};

export const demoAwayTeam: Team = {
  id: "demo-away-team",
  name: "Coletes",
  slug: "coletes",
  ownerId: "demo-away-9",
  visibility: "public",
  members: [
    { userId: "demo-away-9", role: "owner", joinedAt: "2026-07-04T15:00:00.000Z" },
    { userId: "demo-away-11", role: "member", joinedAt: "2026-07-04T15:15:00.000Z" }
  ],
  stats: {
    ...demoStats,
    wins: 11,
    losses: 9,
    goals: 26,
    assists: 9,
    goalDifference: 6,
    points: 37,
    winRate: 45.8,
    form: ["L", "W", "W", "D", "L"]
  },
  createdAt: "2026-07-01T18:00:00.000Z",
  updatedAt: "2026-07-04T19:20:00.000Z"
};

export const demoTournament: Tournament = {
  id: "demo-tournament",
  name: "Copa da Quinta",
  slug: "copa-da-quinta",
  ownerId: demoUser.id,
  format: "league",
  visibility: "public",
  teamIds: [demoHomeTeam.id, demoAwayTeam.id],
  matchIds: ["demo-match"],
  rounds: [
    {
      round: 1,
      pairings: [{ homeTeamId: demoHomeTeam.id, awayTeamId: demoAwayTeam.id, matchId: "demo-match" }],
      createdAt: "2026-07-04T15:00:00.000Z"
    }
  ],
  standings: [
    { teamId: demoHomeTeam.id, stats: demoHomeTeam.stats },
    { teamId: demoAwayTeam.id, stats: demoAwayTeam.stats }
  ],
  createdAt: "2026-07-01T18:00:00.000Z",
  updatedAt: "2026-07-04T19:20:00.000Z"
};

export const demoMatch: Match = {
  id: "demo-match",
  type: "tournament",
  status: "completed",
  createdBy: demoUser.id,
  home: {
    teamId: demoHomeTeam.id,
    score: 3,
    playerIds: [demoUser.id, demoAssistUser.id]
  },
  away: {
    teamId: demoAwayTeam.id,
    score: 2,
    playerIds: ["demo-away-9", "demo-away-11"]
  },
  durationMinutes: 62,
  venue: {
    name: "Arena Society Vila",
    address: "Vila Madalena",
    surface: "synthetic"
  },
  tournamentId: demoTournament.id,
  eventLog: [
    { minute: 8, type: "goal", teamId: demoHomeTeam.id, playerId: demoUser.id, assistPlayerId: demoAssistUser.id },
    { minute: 21, type: "goal", teamId: demoAwayTeam.id, playerId: "demo-away-9" },
    { minute: 37, type: "goal", teamId: demoHomeTeam.id, playerId: demoAssistUser.id, assistPlayerId: demoUser.id },
    { minute: 48, type: "goal", teamId: demoAwayTeam.id, playerId: "demo-away-11" },
    { minute: 59, type: "goal", teamId: demoHomeTeam.id, playerId: demoUser.id }
  ],
  presences: [
    { userId: demoUser.id, status: "confirmed", updatedAt: "2026-07-04T18:00:00.000Z", updatedBy: demoUser.id },
    { userId: demoAssistUser.id, status: "confirmed", updatedAt: "2026-07-04T18:10:00.000Z", updatedBy: demoAssistUser.id },
    { userId: "demo-away-9", status: "confirmed", updatedAt: "2026-07-04T18:15:00.000Z", updatedBy: "demo-away-9" },
    { userId: "demo-away-11", status: "maybe", updatedAt: "2026-07-04T18:20:00.000Z", updatedBy: "demo-away-11" }
  ],
  checkIns: [
    { userId: demoUser.id, checkedInAt: "2026-07-04T20:20:00.000Z" },
    { userId: demoAssistUser.id, checkedInAt: "2026-07-04T20:25:00.000Z" }
  ],
  reviewStatus: "approved",
  eventLogVersion: 1,
  playedAt: "2026-07-04T21:00:00.000Z",
  createdAt: "2026-07-04T15:00:00.000Z",
  updatedAt: "2026-07-04T22:10:00.000Z"
};

export const demoPlayerNames: Record<string, string> = {
  [demoUser.id]: "Léo 10",
  [demoAssistUser.id]: "Dudu",
  "demo-away-9": "Nove",
  "demo-away-11": "Canhoto"
};
