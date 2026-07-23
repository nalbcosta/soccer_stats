"use client";

import { useCallback, useState } from "react";
import { api } from "../lib/api";

export function useTeamMembership() {
  const [pendingTeamId, setPendingTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestJoin = useCallback(async (teamId: string) => {
    setPendingTeamId(teamId);
    setError(null);
    try {
      await api.requestTeamJoin(teamId);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível solicitar entrada.");
      return false;
    } finally {
      setPendingTeamId(null);
    }
  }, []);

  return { pendingTeamId, error, requestJoin };
}
