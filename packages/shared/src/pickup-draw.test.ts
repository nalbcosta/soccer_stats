import { describe, expect, it } from "vitest";
import { balancePickupTeams, type PickupParticipant } from "./pickup-draw.js";

const player = (index: number, goalkeeper = false): PickupParticipant => ({
  id: `p-${index}`,
  name: `Jogador ${index}`,
  source: "member",
  outfield: { pac: (index % 5) + 1, sho: ((index + 1) % 5) + 1, pas: ((index + 2) % 5) + 1, dri: 3, def: 3, phy: 3 },
  isGoalkeeper: goalkeeper,
  ...(goalkeeper ? { goalkeeper: { div: 4, han: 4, kic: 4, ref: 4, spd: 4, pos: 4 } } : {})
});

describe("balancePickupTeams", () => {
  it("distribui 16 atletas em times 6, 5 e 5", () => {
    const result = balancePickupTeams({ participants: Array.from({ length: 16 }, (_, index) => player(index, index < 3)), teamCount: 3, squadSize: 6, seed: "rodada-1" });
    expect(result.teams.map((team) => team.participants.length)).toEqual([6, 5, 5]);
    expect(result.teams.every((team) => team.hasNaturalGoalkeeper)).toBe(true);
  });

  it("exclui excedentes pela ordem de entrada", () => {
    const participants = Array.from({ length: 12 }, (_, index) => player(index));
    const result = balancePickupTeams({ participants, teamCount: 2, squadSize: 5, seed: "lotado" });
    expect(result.excluded.map((item) => item.id)).toEqual(["p-10", "p-11"]);
  });

  it("rejeita menos participantes do que times", () => {
    expect(() => balancePickupTeams({ participants: [player(1)], teamCount: 2, squadSize: 5, seed: 1 })).toThrow(/participantes suficientes/i);
  });
});
