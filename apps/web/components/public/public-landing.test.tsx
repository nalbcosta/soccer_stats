import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicLanding } from "./public-landing";

describe("PublicLanding", () => {
  it("renderiza marca e chamada principal", () => {
    render(<PublicLanding />);

    expect(screen.getByText("NaBola")).toBeInTheDocument();
    expect(screen.getByText("Entrar em campo")).toBeInTheDocument();
  });
});
