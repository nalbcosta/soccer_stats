import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfilePageContent } from "./profile-page-content";

vi.mock("../app/session-provider", () => ({
  useSession: () => ({
    user: {
      id: "user-1",
      email: "jogador@nabola.com",
      username: "camisa10",
      locale: "pt-BR",
      theme: "system",
      providers: ["credentials"]
    },
    dashboard: {
      profile: {
        userId: "user-1",
        displayName: "Camisa 10",
        preferredFoot: "right",
        preferredPosition: "central-midfielder",
        stats: {
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
          recentHighlight: "Ainda sem partidas registradas."
        }
      },
      teams: [],
      matches: [],
      tournaments: [],
      invites: []
    },
    refresh: vi.fn(),
    setFeedback: vi.fn(),
    logout: vi.fn(),
    feedback: ""
  })
}));

vi.mock("../../composables/use-player-card", () => ({
  usePlayerCard: () => ({ card: null, loading: false, refresh: vi.fn() })
}));

vi.mock("./profile-form", () => ({
  ProfileForm: () => <input aria-label="Nome de jogo" defaultValue="Camisa 10" />
}));

vi.mock("./preferences-panel", () => ({
  PreferencesPanel: () => <section>Preferencias</section>
}));

describe("ProfilePageContent", () => {
  it("renderiza formulario de perfil quando ha sessao", () => {
    render(<ProfilePageContent />);

    expect(screen.getByText("Seu card no NaBola")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Camisa 10")).toBeInTheDocument();
  });
});
