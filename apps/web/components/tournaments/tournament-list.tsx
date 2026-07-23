"use client";

import { Trophy } from "lucide-react";
import { useSession } from "../app/session-provider";
import { EmptyState } from "../feedback/empty-state";
import { LoadingListState } from "../feedback/loading-state";
import { SportsListItem } from "../sports/sports-list-item";
import { useTranslations } from "../../i18n/provider";

export function TournamentList() {
  const { dashboard } = useSession();
  const t = useTranslations("tournaments");

  if (!dashboard) {
    return <LoadingListState label={t("loading")} />;
  }

  if (dashboard.tournaments.length === 0) {
    return <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {dashboard.tournaments.map((tournament) => (
        <SportsListItem
          description={t("teamsCount", { count: tournament.teamIds.length })}
          href={`/app/tournaments/${tournament.id}`}
          icon={Trophy}
          key={tournament.id}
          meta={<p className="text-sm font-semibold text-muted">{t("matchesCount", { count: tournament.matchIds.length })}</p>}
          title={tournament.name}
          tone="marker"
        />
      ))}
    </div>
  );
}
