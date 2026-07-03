import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthForm } from "./auth-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock("../locale-provider", () => ({
  useLocale: () => ({ locale: "pt-BR" })
}));

vi.mock("../google-login", () => ({
  GoogleLogin: () => <button type="button">Entrar com Google</button>
}));

describe("AuthForm", () => {
  it("renderiza formulario dedicado de login", () => {
    render(<AuthForm />);

    expect(screen.getByText("Entrar no vestiario")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email@exemplo.com")).toBeInTheDocument();
  });
});
