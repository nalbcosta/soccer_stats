import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileTabBar } from "./mobile-tab-bar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/app"
}));

vi.mock("./session-provider", () => ({
  useSession: () => ({
    dashboard: {
      invites: [],
      matches: [],
      profile: null
    }
  })
}));

vi.mock("../locale-provider", () => ({
  useLocale: () => ({
    locale: "pt-BR"
  })
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light"
  })
}));

describe("MobileTabBar", () => {
  it("mostra os destinos principais do app", () => {
    render(<MobileTabBar />);

    expect(screen.getByText("Resumo")).toBeInTheDocument();
    expect(screen.getByText("Jogos")).toBeInTheDocument();
    expect(screen.getByText("Times")).toBeInTheDocument();
    expect(screen.getByText("Ranking")).toBeInTheDocument();
    expect(screen.getByText("Mais")).toBeInTheDocument();
  });
});
