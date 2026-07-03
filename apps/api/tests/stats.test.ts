import { describe, expect, it } from "vitest";
import { createEmptyStats } from "@soccer-stats/shared";
import { calculatePlayerStats, calculateTeamStats } from "../src/lib/stats-service.js";
import type { Match, Team } from "@soccer-stats/shared";

const team: Team = {
  id: "team-1",
  name: "Azuis",
  slug: "azuis",
  ownerId: "u1",
  members: [{ userId: "u1", role: "owner", joinedAt: new Date().toISOString() }],
  stats: createEmptyStats(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const match: Match = {
  id: "m1",
  type: "casual",
  status: "completed",
  createdBy: "u1",
  home: { teamId: "team-1", score: 3, playerIds: ["u1"] },
  away: { teamId: "team-2", score: 1, playerIds: ["u2"] },
  eventLog: [
    { minute: 10, type: "goal", playerId: "u1", teamId: "team-1" },
    { minute: 20, type: "goal", playerId: "u1", teamId: "team-1" },
    { minute: 25, type: "assist", playerId: "u1", teamId: "team-1" }
  ],
  playedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe("stats-service", () => {
  it("calcula estatisticas do time", () => {
    const stats = calculateTeamStats(team, [match]);
    expect(stats.wins).toBe(1);
    expect(stats.points).toBe(3);
    expect(stats.goalDifference).toBe(2);
  });

  it("calcula estatisticas do jogador", () => {
    const stats = calculatePlayerStats("u1", [match]);
    expect(stats.goals).toBe(2);
    expect(stats.assists).toBe(1);
    expect(stats.matchesPlayed).toBe(1);
  });
});
