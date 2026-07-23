import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardResponse } from "../../lib/api";
import type { DashboardHomeViewModel } from "../../lib/dashboard/build-dashboard-view-model";
import type { AggregatedStats, Match, PlayerCardProjection, PublicUser, Team } from "@soccer-stats/shared";
import { DashboardOverview } from "./dashboard-overview";

const user: PublicUser = {
  id: "user-1",
  email: "jogador@nabola.com",
  username: "camisa10",
  locale: "pt-BR",
  theme: "system",
  providers: ["credentials"]
};

const stats: AggregatedStats = {
  matchesPlayed: 1,
  wins: 1,
  draws: 0,
  losses: 0,
  goals: 2,
  assists: 1,
  saves: 0,
  cleanSheets: 0,
  goalDifference: 2,
  points: 3,
  winRate: 100,
  goalsPerMatch: 2,
  form: ["W"],
  recentHighlight: "Boa fase."
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

const match: Match = {
  id: "match-1",
  type: "casual",
  status: "scheduled",
  createdBy: "user-1",
  home: { teamId: "team-1", score: 0, playerIds: ["user-1"] },
  away: { teamId: "team-2", score: 0, playerIds: [] },
  eventLog: [],
  presences: [],
  checkIns: [],
  reviewStatus: "none",
  eventLogVersion: 1,
  playedAt: "2099-01-01T10:00:00.000Z",
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-01T10:00:00.000Z"
};

const dashboard: DashboardResponse = {
  profile: {
    userId: "user-1",
    displayName: "Camisa 10",
    preferredFoot: "right",
    preferredPosition: "central-midfielder",
    stats
  },
  teams: [team],
  matches: [match],
  tournaments: [],
  invites: [],
  venues: [],
  notifications: []
};

const card: PlayerCardProjection = {
  playerId: "user-1",
  ratingVersion: "v3",
  score: 82,
  confidence: "forming",
  stats,
  factors: [{ key: "goalsPerMatch", value: 80, weight: 0.2 }],
  sourceSignature: "match-1",
  updatedAt: "2026-07-01T10:00:00.000Z"
};

function makeViewModel(input: Partial<DashboardHomeViewModel> = {}): DashboardHomeViewModel {
  return {
    metrics: [{ key: "teams", label: "Times", value: 1, helper: "Elencos ativos" }],
    nextMatch: {
      match,
      href: "/app/matches/match-1",
      homeName: "Bola FC",
      awayName: "Rua FC"
    },
    actions: [
      {
        key: "presence-match-1",
        tone: "primary",
        title: "Confirme sua presença",
        description: "A turma precisa saber se você vai jogar.",
        href: "/app/matches/match-1",
        actionLabel: "Responder"
      }
    ],
    playerRanking: [],
    teamRanking: [],
    unreadNotifications: [],
    venues: [],
    card: null,
    insights: [],
    hasTeams: true,
    hasMatches: true,
    showActionQueue: true,
    showNotifications: false,
    showVenues: false,
    ...input
  };
}

const homeState = vi.hoisted(() => ({
  value: undefined as unknown as ReturnType<typeof import("../../composables/use-dashboard-home").useDashboardHome>
}));

vi.mock("../app/session-provider", () => ({
  useSession: () => ({
    user,
    setFeedback: vi.fn()
  })
}));

vi.mock("../../composables/use-dashboard-home", () => ({
  useDashboardHome: () => homeState.value
}));

vi.mock("../sports/player-card", () => ({
  PlayerCard: ({ viewModel }: { viewModel: { overall: number } }) => <article>NaBola Card {viewModel.overall}</article>
}));

describe("DashboardOverview", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    homeState.value = {
      dashboard,
      error: null,
      loading: false,
      markAllNotificationsRead: vi.fn(),
      refreshing: false,
      retry: vi.fn(),
      viewModel: makeViewModel()
    };
  });

  it("renderiza loading quando os dados ainda nao chegaram", () => {
    homeState.value = { ...homeState.value, loading: true, viewModel: null };

    render(<DashboardOverview />);

    expect(screen.getByText("Carregando vestiário...")).toBeInTheDocument();
  });

  it("renderiza empty state quando nao ha times", () => {
    homeState.value = {
      ...homeState.value,
      loading: false,
      viewModel: makeViewModel({ hasTeams: false, metrics: [], nextMatch: null })
    };

    render(<DashboardOverview />);

    expect(screen.getByText("Comece pelo primeiro time")).toBeInTheDocument();
  });

  it("renderiza o proximo jogo", () => {
    homeState.value = {
      ...homeState.value,
      loading: false,
      viewModel: makeViewModel()
    };

    render(<DashboardOverview />);

    expect(screen.getByText("Próximo jogo")).toBeInTheDocument();
    expect(screen.getByText("Bola FC")).toBeInTheDocument();
  });

  it("renderiza o card unificado com o score persistido quando disponivel", () => {
    homeState.value = {
      ...homeState.value,
      loading: false,
      viewModel: makeViewModel({ card })
    };

    render(<DashboardOverview />);

    expect(screen.getByText("NaBola Card 82")).toBeInTheDocument();
  });

  it("usa fallback de profile quando card v2 nao existe", () => {
    homeState.value = {
      ...homeState.value,
      loading: false,
      viewModel: makeViewModel({ card: null })
    };

    render(<DashboardOverview />);

    expect(screen.getByText("NaBola Card 35")).toBeInTheDocument();
  });
});
