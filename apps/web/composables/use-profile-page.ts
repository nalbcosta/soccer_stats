"use client";

import { useSession } from "../components/app/session-provider";
import { usePlayerCard } from "./use-player-card";

export function useProfilePage() {
  const { dashboard, user } = useSession();
  const { card } = usePlayerCard(user?.id);

  return {
    card,
    profile: dashboard?.profile ?? null,
    teams: dashboard?.teams ?? [],
    user,
    isLoading: !dashboard || !user
  };
}
