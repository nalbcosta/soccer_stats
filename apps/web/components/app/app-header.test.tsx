import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "./app-header";

const navigationState = vi.hoisted(() => ({
  pathname: "/app",
  back: vi.fn(),
  push: vi.fn()
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useRouter: () => ({
    back: navigationState.back,
    push: navigationState.push
  })
}));

vi.mock("./session-provider", () => ({
  useSession: () => ({
    dashboard: {
      invites: [],
      matches: [],
      notifications: [],
      profile: null
    },
    user: {
      publicIdentifier: "#331AF5",
      username: "nalbertcosta"
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

describe("AppHeader", () => {
  afterEach(cleanup);

  beforeEach(() => {
    navigationState.pathname = "/app";
    navigationState.back.mockClear();
    navigationState.push.mockClear();
  });

  it("nao mostra voltar na dashboard", () => {
    render(<AppHeader />);

    expect(screen.queryByLabelText("Voltar")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Ir para o resumo")).toBeInTheDocument();
  });

  it("mostra voltar fora da dashboard", () => {
    navigationState.pathname = "/app/matches/match-1";

    render(<AppHeader />);

    expect(screen.getByLabelText("Voltar")).toBeInTheDocument();
  });

  it("mostra o identificador no cabecalho e no perfil da conta", () => {
    render(<AppHeader />);

    expect(screen.getAllByText("#331AF5")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu da conta" }));
    expect(screen.getAllByText("#331AF5")).toHaveLength(2);
  });
});
