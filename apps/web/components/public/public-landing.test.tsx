import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PublicLanding } from "./public-landing";

vi.mock("../locale-provider", () => ({
  useLocale: () => ({
    locale: "pt-BR",
    setLocale: vi.fn()
  })
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme: vi.fn()
  })
}));

describe("PublicLanding", () => {
  it("renderiza marca e chamada principal", () => {
    render(<PublicLanding />);

    expect(screen.getAllByText("NaBola")).toHaveLength(2);
    expect(screen.getByText("Entrar em campo")).toBeInTheDocument();
    expect(screen.getByText("Acessar plataforma")).toBeInTheDocument();
    expect(screen.queryByText("Voltar ao topo")).not.toBeInTheDocument();
  });
});
