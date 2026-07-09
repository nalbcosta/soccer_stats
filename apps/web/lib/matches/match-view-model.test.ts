import { describe, expect, it } from "vitest";
import type { AggregatedStats, Match, Team, Venue } from "@soccer-stats/shared";
import type { DashboardResponse } from "../api";
import { buildMatchListItems, buildSheetSummary, getUserRegion, selectNearbyMatches } from "./match-view-model";

const stats: AggregatedStats = {
  matchesPlayed: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goals: 0,
  assists: 0,
  saves: 0,
  cleanSheets: 0,
  goalDifference: 0,
  points: 0,
  winRate: 0,
  goalsPerMatch: 0,
  form: [],
  recentHighlight: "Sem jogos."
};

const team: Team = {
  id: "team-1",
  name: "Bola FC",
  slug: "bola-fc",
  ownerId: "user-1",
  visibility: "private",
  city: "Sao Paulo",
  state: "SP",
  members: [],
  stats,
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-01T10:00:00.000Z"
};

const venue: Venue = {
  id: "venue-1",
  name: "Arena Bairro",
  slug: "arena-bairro",
  ownerId: "user-1",
  visibility: "public",
  city: "Sao Paulo",
  state: "SP",
  surface: "synthetic",
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-01T10:00:00.000Z"
};

function makeMatch(input: Partial<Match>): Match {
  return {
    id: input.id ?? "match-1",
    type: "casual",
    status: input.status ?? "scheduled",
    createdBy: "user-1",
    home: { teamId: "team-1", score: 1, playerIds: ["user-1"] },
    away: { teamId: "team-2", score: 0, playerIds: ["user-2"] },
    eventLog: [],
    presences: [],
    checkIns: [],
    reviewStatus: "none",
    eventLogVersion: 1,
    playedAt: "2099-01-01T10:00:00.000Z",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
    ...input
  };
}

function makeDashboard(input: Partial<DashboardResponse> = {}): DashboardResponse {
  return {
    profile: null,
    teams: [team],
    matches: [],
    tournaments: [],
    invites: [],
    venues: [venue],
    notifications: [],
    ...input
  };
}

describe("match view model", () => {
  it("deriva regiao do usuario a partir dos times", () => {
    expect(getUserRegion(makeDashboard())).toEqual({ city: "Sao Paulo", state: "SP" });
  });

  it("seleciona jogos na regiao com local cadastrado", () => {
    const items = buildMatchListItems(makeDashboard({ matches: [makeMatch({ venueId: "venue-1" })] }));

    expect(selectNearbyMatches(items)).toHaveLength(1);
  });

  it("valida se placar bate com súmula", () => {
    const match = makeMatch({
      eventLog: [{ minute: 10, type: "goal", teamId: "team-1", playerId: "user-1" }]
    });

    expect(buildSheetSummary(match).scoreMatchesSheet).toBe(true);
  });
});
