import { describe, expect, it } from "vitest";
import type { Team } from "@soccer-stats/shared";
import type { DashboardResponse } from "./api";
import { findTeam } from "./entity-lookup";

describe("findTeam", () => {
  const team = { id: "team-uuid", slug: "resenha-fc-a1b2c3" } as Team;
  const dashboard = { teams: [team] } as DashboardResponse;

  it("localiza o time pelo slug publico", () => {
    expect(findTeam(dashboard, team.slug)).toMatchObject({ status: "found", entity: team });
  });

  it("mantem compatibilidade com links antigos pelo id", () => {
    expect(findTeam(dashboard, team.id)).toMatchObject({ status: "found", entity: team });
  });
});
