import type { DashboardResponse } from "./api";

export type EntityLookupResult<T> =
  | { status: "loading"; entity: null }
  | { status: "found"; entity: T }
  | { status: "not-found"; entity: null };

export const findTeam = (dashboard: DashboardResponse | null, identifier: string): EntityLookupResult<DashboardResponse["teams"][number]> => {
  if (!dashboard) {
    return { status: "loading", entity: null };
  }

  const entity = dashboard.teams.find((team) => team.slug === identifier || team.id === identifier);
  return entity ? { status: "found", entity } : { status: "not-found", entity: null };
};

export const findMatch = (dashboard: DashboardResponse | null, id: string): EntityLookupResult<DashboardResponse["matches"][number]> => {
  if (!dashboard) {
    return { status: "loading", entity: null };
  }

  const entity = dashboard.matches.find((match) => match.id === id);
  return entity ? { status: "found", entity } : { status: "not-found", entity: null };
};

export const findTournament = (
  dashboard: DashboardResponse | null,
  id: string
): EntityLookupResult<DashboardResponse["tournaments"][number]> => {
  if (!dashboard) {
    return { status: "loading", entity: null };
  }

  const entity = dashboard.tournaments.find((tournament) => tournament.id === id);
  return entity ? { status: "found", entity } : { status: "not-found", entity: null };
};
