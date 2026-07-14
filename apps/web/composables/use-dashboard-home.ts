"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlayerCardProjection, PlayerRankingEntry } from "@soccer-stats/shared";
import { useSession } from "../components/app/session-provider";
import { useTranslations } from "../i18n/provider";
import { api, type DashboardResponse } from "../lib/api";
import { buildDashboardViewModel, type DashboardHomeViewModel } from "../lib/dashboard/build-dashboard-view-model";

interface DashboardHomeState {
  viewModel: DashboardHomeViewModel | null;
  dashboard: DashboardResponse | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  retry: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

async function settle<T>(task: Promise<T>): Promise<T | null> {
  try {
    return await task;
  } catch {
    return null;
  }
}

export function useDashboardHome(): DashboardHomeState {
  const { dashboard, user, refresh, status, setFeedback, markAllNotificationsRead: markAllSessionNotificationsRead } = useSession();
  const text = useTranslations("dashboard");
  const [card, setCard] = useState<PlayerCardProjection | null>(null);
  const [playerRanking, setPlayerRanking] = useState<PlayerRankingEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadExtras = useCallback(async () => {
    if (!user) {
      return;
    }

    setRefreshing(true);
    const [cardResult, rankingResult] = await Promise.all([
      settle(api.getPlayerCard(user.id)),
      settle(api.getPlayerRankings({ metric: "overall", period: "all" }))
    ]);

    setCard(cardResult?.card ?? null);
    setPlayerRanking(rankingResult?.players ?? []);
    setError(rankingResult ? null : "Alguns dados avançados não carregaram agora.");
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    void loadExtras();
  }, [loadExtras]);

  const retry = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    await loadExtras();
    setRefreshing(false);
  }, [loadExtras, refresh]);

  const markAllNotificationsRead = useCallback(async () => {
    await markAllSessionNotificationsRead();
    setFeedback(text("notificationsMarkedRead"));
  }, [markAllSessionNotificationsRead, setFeedback, text]);

  const viewModel = useMemo(() => {
    if (!dashboard || !user) {
      return null;
    }

    return buildDashboardViewModel({
      card,
      dashboard,
      playerRanking,
      user
    });
  }, [card, dashboard, playerRanking, user]);

  return {
    viewModel,
    dashboard,
    error,
    loading: status === "loading" || !dashboard || !user,
    refreshing,
    retry,
    markAllNotificationsRead
  };
}
