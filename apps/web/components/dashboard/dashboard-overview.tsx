"use client";

import { RefreshCw } from "lucide-react";
import { useSession } from "../app/session-provider";
import { useDashboardHome } from "../../composables/use-dashboard-home";
import { EmptyState } from "../feedback/empty-state";
import { LoadingState } from "../feedback/loading-state";
import { Button } from "../ui/button";
import { DashboardActionQueue } from "./dashboard-action-queue";
import { DashboardMetricGrid } from "./dashboard-metric-grid";
import { DashboardNextMatchPanel } from "./dashboard-next-match-panel";
import { DashboardNotificationsPreview } from "./dashboard-notifications-preview";
import { DashboardPlayerCardPanel } from "./dashboard-player-card-panel";
import { DashboardPlayerRankingPreview } from "./dashboard-player-ranking-preview";
import { DashboardVenuesPreview } from "./dashboard-venues-preview";
import { useTranslations } from "../../i18n/provider";
import { buildPlayerCardViewModel } from "../../lib/player-card/build-player-card-view-model";

export function DashboardOverview() {
  const t = useTranslations("dashboard");
  const profileText = useTranslations("profile");
  const teams = useTranslations("teams");
  const { user } = useSession();
  const { dashboard, error, loading, markAllNotificationsRead, refreshing, retry, viewModel } = useDashboardHome();

  if (loading || !dashboard || !user || !viewModel) {
    return <LoadingState />;
  }

  return (
    <div className="grid gap-4">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-field">{t("dashboard")}</p>
          <p className="mt-1 text-sm font-semibold text-muted">{t("dashboardDescription")}</p>
        </div>
        <Button className="min-h-10 shrink-0 px-3 md:px-4" disabled={refreshing} onClick={() => void retry()} type="button" variant="secondary">
          <RefreshCw className={refreshing ? "animate-spin" : ""} size={16} />
          <span className="sr-only sm:not-sr-only">{t("refresh")}</span>
        </Button>
      </header>

      {error ? (
        <div className="rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm font-semibold text-text">
          {error}
        </div>
      ) : null}

      {!viewModel.hasTeams ? (
        <EmptyState
          actionHref="/app/teams"
          actionLabel={teams("createTeam")}
          description={t("createFirstTeamDescription")}
          title={t("createFirstTeam")}
        />
      ) : null}

      <DashboardMetricGrid metrics={viewModel.metrics} />

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.75fr)]">
        <main className="grid min-w-0 gap-4">
          <DashboardNextMatchPanel nextMatch={viewModel.nextMatch} />
          {viewModel.showActionQueue ? <DashboardActionQueue actions={viewModel.actions} /> : null}
        </main>

        <aside className="grid min-w-0 content-start gap-4">
          <DashboardPlayerCardPanel viewModel={buildPlayerCardViewModel(dashboard.profile, user, viewModel.card, profileText)} />
          <DashboardPlayerRankingPreview players={viewModel.playerRanking} />
          {viewModel.showNotifications ? (
            <DashboardNotificationsPreview
              notifications={viewModel.unreadNotifications}
              onReadAll={markAllNotificationsRead}
              refreshing={refreshing}
            />
          ) : null}
          {viewModel.showVenues ? <DashboardVenuesPreview venues={viewModel.venues} /> : null}
        </aside>
      </div>
    </div>
  );
}
