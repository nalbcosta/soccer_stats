import { describe, expect, it } from "vitest";
import { canUseRouterBack, resolveAppBackFallback } from "./navigation";

describe("navigation", () => {
  it("resolve fallback para rotas de detalhe", () => {
    expect(resolveAppBackFallback("/app/matches/match-1")).toBe("/app/matches");
    expect(resolveAppBackFallback("/app/teams/team-1")).toBe("/app/teams");
    expect(resolveAppBackFallback("/app/tournaments/tournament-1")).toBe("/app/tournaments");
  });

  it("usa dashboard como fallback para rotas principais", () => {
    expect(resolveAppBackFallback("/app/ranking")).toBe("/app");
    expect(resolveAppBackFallback("/app/settings")).toBe("/app");
  });

  it("so usa router.back quando o historico tem indice interno", () => {
    expect(canUseRouterBack({ idx: 1 })).toBe(true);
    expect(canUseRouterBack({ idx: 0 })).toBe(false);
    expect(canUseRouterBack({})).toBe(false);
    expect(canUseRouterBack(null)).toBe(false);
  });
});
