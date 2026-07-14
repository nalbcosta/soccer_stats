import { describe, expect, it } from "vitest";
import type { AggregatedStats, Invite, Match, Notification, PlayerRankingEntry, PublicUser, Team, Tournament, Venue } from "@soccer-stats/shared";
import type { DashboardResponse } from "../api";
import { buildDashboardViewModel } from "./build-dashboard-view-model";
import { selectNextMatch } from "./dashboard-match-selectors";
import { selectPlayerRankingPreview } from "./dashboard-ranking-selectors";

const stats: AggregatedStats = {
  matchesPlayed: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goals: 0,
  assists: 0,
  saves: 0,
  cleanSheets: 0,
  goalDifference: 0,
  points: 0,
  winRate: 0,
  goalsPerMatch: 0,
  form: [],
  recentHighlight: "Ainda sem partidas."
};

const user: PublicUser = {
  id: "user-1",
  email: "jogador@nabola.com",
  username: "camisa10",
  locale: "pt-BR",
  theme: "system",
  providers: ["credentials"]
};

const team: Team = {
  id: "team-1",
  name: "Bola FC",
  slug: "bola-fc",
  ownerId: "user-1",
  visibility: "private",
  members: [{ userId: "user-1", role: "owner", joinedAt: "2026-07-01T10:00:00.000Z" }],
  stats,
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-01T10:00:00.000Z"
};

const venue: Venue = {
  id: "venue-1",
  name: "Arena Bairro",
  slug: "arena-bairro",
  ownerId: "user-1",
  visibility: "private",
  city: "Sao Paulo",
  state: "SP",
  surface: "synthetic",
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-01T10:00:00.000Z"
};

function makeMatch(input: Partial<Match>): Match {
  return {
    id: input.id ?? "match-1",
    type: "casual",
    status: input.status ?? "scheduled",
    createdBy: "user-1",
    home: { teamId: "team-1", score: 0, playerIds: ["user-1"] },
    away: { teamId: "team-2", score: 0, playerIds: [] },
    eventLog: [],
    presences: [],
    checkIns: [],
    reviewStatus: "none",
    eventLogVersion: 1,
    playedAt: input.playedAt ?? "2099-01-01T10:00:00.000Z",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
    ...input
  };
}

function makeDashboard(input: Partial<DashboardResponse> = {}): DashboardResponse {
  return {
    profile: null,
    teams: [team],
    matches: [],
    tournaments: [],
    invites: [],
    venues: [venue],
    notifications: [],
    ...input
  };
}

function makeRanking(input: Partial<PlayerRankingEntry>): PlayerRankingEntry {
  return {
    playerId: input.playerId ?? "user-1",
    displayName: input.displayName ?? "Camisa 10",
    stats,
    ratings: {
      ratingVersion: "v1",
      overall: 70,
      attack: 70,
      pass: 70,
      presence: 70,
      regularity: 70,
      winning: 70,
      form: 70
    },
    rank: input.rank ?? 1,
    explanation: "Resumo",
    ...input
  };
}

describe("dashboard selectors", () => {
  it("seleciona proximo jogo entre scheduled e confirming e ignora cancelled", () => {
    const cancelled = makeMatch({ id: "cancelled", status: "cancelled", playedAt: "2099-01-01T09:00:00.000Z" });
    const scheduled = makeMatch({ id: "scheduled", status: "scheduled", playedAt: "2099-01-03T09:00:00.000Z" });
    const confirming = makeMatch({ id: "confirming", status: "confirming", playedAt: "2099-01-02T09:00:00.000Z" });

    expect(selectNextMatch([cancelled, scheduled, confirming])?.id).toBe("confirming");
  });

  it("calcula metricas e prioriza acao de presenca", () => {
    const match = makeMatch({
      presences: [{ userId: "user-1", status: "pending", updatedAt: "2026-07-01T10:00:00.000Z", updatedBy: "user-1" }]
    });
    const notification: Notification = {
      id: "notification-1",
      userId: "user-1",
      type: "match-scheduled",
      title: "Jogo marcado",
      message: "Tem jogo novo.",
      createdAt: "2026-07-01T10:00:00.000Z"
    };
    const invite: Invite = {
      id: "invite-1",
      resourceType: "team",
      resourceId: "team-1",
      email: user.email,
      role: "member",
      status: "pending",
      invitedBy: "user-2",
      createdAt: "2026-07-01T10:00:00.000Z"
    };
    const viewModel = buildDashboardViewModel({
      card: null,
      dashboard: makeDashboard({ invites: [invite], matches: [match], notifications: [notification] }),
      insights: [],
      playerRanking: [],
      user
    });

    expect(viewModel.metrics.find((metric) => metric.key === "venues")?.value).toBe(1);
    expect(viewModel.actions[0]?.key).toBe("presence-match-1");
  });

  it("ordena ranking preview por rank", () => {
    const players = [makeRanking({ playerId: "two", rank: 2 }), makeRanking({ playerId: "one", rank: 1 })];

    expect(selectPlayerRankingPreview(players).map((player) => player.playerId)).toEqual(["one", "two"]);
  });

  it("alinha o score do proprio jogador com o Card v2", () => {
    const viewModel = buildDashboardViewModel({
      card: {
        playerId: "user-1",
        ratingVersion: "v3",
        score: 59,
        confidence: "forming",
        stats,
        factors: [],
        sourceSignature: "match-1",
        updatedAt: "2026-07-01T10:00:00.000Z"
      },
      dashboard: makeDashboard(),
      insights: [],
      playerRanking: [makeRanking({ playerId: "user-1", rank: 1, ratings: { ...makeRanking({}).ratings, overall: 61 } })],
      user
    });

    expect(viewModel.playerRanking[0]?.ratings.overall).toBe(59);
    expect(viewModel.playerRanking[0]?.ratings.ratingVersion).toBe("v1");
  });
});
