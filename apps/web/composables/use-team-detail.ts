"use client";

import { useCallback, useEffect, useState } from "react";
import type { Team, TeamJoinRequest } from "@soccer-stats/shared";
import { api } from "../lib/api";

export function useTeamDetail(team: Team, canManage: boolean) {
  const [requests, setRequests] = useState<TeamJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const pending = canManage ? await api.listTeamJoinRequests(team.id) : { requests: [] };
      setRequests(pending.requests.filter((item) => item.status === "pending"));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível carregar a atividade do time."); }
    finally { setLoading(false); }
  }, [canManage, team.id]);
  useEffect(() => { void reload(); }, [reload]);
  const reviewRequest = useCallback(async (requestId: string, decision: "approve" | "reject") => { await api.reviewTeamJoinRequest(team.id, requestId, decision); setRequests((current) => current.filter((item) => item.id !== requestId)); }, [team.id]);
  return { requests, loading, error, reload, reviewRequest };
}
