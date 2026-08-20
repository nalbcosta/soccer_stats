import { describe, expect, it } from "vitest";
import { athleteSkillsInputSchema } from "./contracts.js";

const outfield = { pac: 3, sho: 3, pas: 3, dri: 3, def: 3, phy: 3 };

describe("athleteSkillsInputSchema", () => {
  it("aceita jogador de linha com estrelas completas", () => {
    expect(athleteSkillsInputSchema.safeParse({ outfield, isGoalkeeper: false }).success).toBe(true);
  });

  it("exige os seis atributos adicionais de quem marca goleiro", () => {
    expect(athleteSkillsInputSchema.safeParse({ outfield, isGoalkeeper: true }).success).toBe(false);
    expect(athleteSkillsInputSchema.safeParse({ outfield, isGoalkeeper: true, goalkeeper: { div: 4, han: 4, kic: 4, ref: 5, spd: 3, pos: 4 } }).success).toBe(true);
  });

  it("rejeita valores fora de uma a cinco estrelas", () => {
    expect(athleteSkillsInputSchema.safeParse({ outfield: { ...outfield, pac: 6 }, isGoalkeeper: false }).success).toBe(false);
  });
});
