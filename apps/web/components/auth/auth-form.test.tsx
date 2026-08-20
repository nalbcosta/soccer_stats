import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(cleanup);

describe("AuthForm", () => {
  it("renderiza formulario dedicado de login", () => {
    render(<AuthForm />);

    expect(screen.getByText("Entrar no vestiário")).toBeInTheDocument();
    expect(screen.getByText("Lembrar de mim neste dispositivo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email@exemplo.com")).toBeInTheDocument();
  });

  it("separa o autocomplete do apelido e preserva letras maiusculas", () => {
    const { getByLabelText, getByRole } = render(<AuthForm />);

    fireEvent.click(getByRole("button", { name: "Criar conta" }));
    const nickname = getByLabelText("Apelido");

    expect(nickname).toHaveAttribute("autocomplete", "section-signup nickname");
    fireEvent.change(nickname, { target: { value: "Camisa10" } });
    expect(nickname).toHaveValue("Camisa10");
  });
});
