import Link from "next/link";
import type { DashboardMatchSummary } from "../../lib/dashboard/dashboard-match-selectors";
import { EmptyState } from "../feedback/empty-state";
import { ScoreboardCard } from "../sports/scoreboard-card";
import { useTranslations } from "../../i18n/provider";

export function DashboardNextMatchPanel({ nextMatch }: { nextMatch: DashboardMatchSummary | null }) {
  const t = useTranslations("match");
  if (!nextMatch) {
    return (
      <EmptyState
        actionHref="/app/matches"
        actionLabel={t("schedule")}
        description={t("nextMatchDescription")}
        title={t("noScheduled")}
      />
    );
  }

  return (
    <Link href={nextMatch.href}>
      <ScoreboardCard
        awayName={nextMatch.awayName}
        awayScore={nextMatch.match.away.score}
        eyebrow={t("next")}
        homeName={nextMatch.homeName}
        homeScore={nextMatch.match.home.score}
        match={nextMatch.match}
        status={nextMatch.match.status}
        {...(nextMatch.tournament ? { tournament: nextMatch.tournament } : {})}
      />
    </Link>
  );
}
