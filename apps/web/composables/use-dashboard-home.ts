"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Notification, PlayerCardV2, PlayerInsight, PlayerRankingEntry } from "@soccer-stats/shared";
import { useSession } from "../components/app/session-provider";
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
  const { dashboard, user, refresh, status, setFeedback } = useSession();
  const [card, setCard] = useState<PlayerCardV2 | null>(null);
  const [insights, setInsights] = useState<PlayerInsight[]>([]);
  const [playerRanking, setPlayerRanking] = useState<PlayerRankingEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadExtras = useCallback(async () => {
    if (!user) {
      return;
    }

    setRefreshing(true);
    const [cardResult, insightsResult, rankingResult, notificationsResult] = await Promise.all([
      settle(api.getPlayerCard(user.id)),
      settle(api.getPlayerInsights(user.id)),
      settle(api.getPlayerRankings({ metric: "overall", period: "all" })),
      settle(api.listNotifications())
    ]);

    setCard(cardResult?.card ?? null);
    setInsights(insightsResult?.insights ?? []);
    setPlayerRanking(rankingResult?.players ?? []);
    setNotifications(notificationsResult?.notifications ?? null);
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
    await api.markAllNotificationsRead();
    setFeedback("Avisos marcados como lidos.");
    await retry();
  }, [retry, setFeedback]);

  const enrichedDashboard = useMemo<DashboardResponse | null>(() => {
    if (!dashboard) {
      return null;
    }

    return {
      ...dashboard,
      notifications: notifications ?? dashboard.notifications
    };
  }, [dashboard, notifications]);

  const viewModel = useMemo(() => {
    if (!enrichedDashboard || !user) {
      return null;
    }

    return buildDashboardViewModel({
      card,
      dashboard: enrichedDashboard,
      insights,
      playerRanking,
      user
    });
  }, [card, enrichedDashboard, insights, playerRanking, user]);

  return {
    viewModel,
    dashboard: enrichedDashboard,
    error,
    loading: status === "loading" || !dashboard || !user,
    refreshing,
    retry,
    markAllNotificationsRead
  };
}
