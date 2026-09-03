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
  it("preenche exatamente as vagas de linha e gol de cada time", () => {
    const result = balancePickupTeams({ participants: Array.from({ length: 16 }, (_, index) => player(index, index < 3)), teamCount: 3, outfieldPlayersPerTeam: 4, goalkeepersPerTeam: 1, seed: "rodada-1" });
    expect(result.teams.every((team) => team.outfieldPlayers.length === 4)).toBe(true);
    expect(result.teams.every((team) => team.goalkeepers.length === 1)).toBe(true);
    expect(result.teams.every((team) => team.participants.length === 5)).toBe(true);
    expect(result.excluded).toHaveLength(1);
  });

  it("permite sorteio parcial e reparte os presentes em quantidades iguais", () => {
    const goalkeepers = [player(10, true), player(11, true)].map((participant) => ({ ...participant, canPlayOutfield: false }));
    const result = balancePickupTeams({
      participants: [...Array.from({ length: 10 }, (_, index) => player(index)), ...goalkeepers],
      teamCount: 3,
      outfieldPlayersPerTeam: 4,
      goalkeepersPerTeam: 1,
      seed: 1,
    });
    expect(result.teams.map((team) => team.participants.length).sort()).toEqual([4, 4, 4]);
    expect(result.teams.reduce((total, team) => total + team.goalkeeperVacancies, 0)).toBe(1);
    expect(result.teams.reduce((total, team) => total + team.outfieldVacancies, 0)).toBe(2);
  });

  it("não coloca goleiro exclusivo em vaga de linha", () => {
    const goalkeeperOnly = { ...player(1, true), canPlayOutfield: false };
    const result = balancePickupTeams({ participants: [goalkeeperOnly], teamCount: 2, outfieldPlayersPerTeam: 1, goalkeepersPerTeam: 1, seed: 1 });
    expect(result.teams.flatMap((team) => team.outfieldPlayers)).not.toContainEqual(goalkeeperOnly);
    expect(result.teams.reduce((total, team) => total + team.outfieldVacancies, 0)).toBe(2);
  });

  it("aceita formacao sem vagas de goleiro", () => {
    const result = balancePickupTeams({ participants: Array.from({ length: 4 }, (_, index) => player(index)), teamCount: 2, outfieldPlayersPerTeam: 2, goalkeepersPerTeam: 0, seed: "sem-gol" });
    expect(result.teams.every((team) => team.goalkeepers.length === 0)).toBe(true);
  });
});
