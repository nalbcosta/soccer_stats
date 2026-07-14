"use client";

import { useCallback, useEffect, useState } from "react";
import type { Team } from "@soccer-stats/shared";
import { api, type PaginationMeta, type TeamListFilters } from "../lib/api";

const initialPagination: PaginationMeta = { page: 1, pageSize: 12, total: 0, totalPages: 1 };

export function useTeamDiscovery(filters: Omit<TeamListFilters, "scope" | "page" | "pageSize"> = {}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.listTeams({ scope: "discover", pageSize: initialPagination.pageSize, ...filters });
      setTeams(response.teams);
      setPagination(response.pagination ?? { ...initialPagination, total: response.teams.length });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível descobrir times.");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [filters.city, filters.latitude, filters.longitude, filters.q, filters.radiusKm, filters.state]);

  useEffect(() => { void reload(); }, [reload]);
  return { teams, pagination, loading, error, reload };
}
