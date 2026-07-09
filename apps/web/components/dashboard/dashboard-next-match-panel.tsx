import Link from "next/link";
import type { DashboardMatchSummary } from "../../lib/dashboard/dashboard-match-selectors";
import { EmptyState } from "../feedback/empty-state";
import { ScoreboardCard } from "../sports/scoreboard-card";

export function DashboardNextMatchPanel({ nextMatch }: { nextMatch: DashboardMatchSummary | null }) {
  if (!nextMatch) {
    return (
      <EmptyState
        actionHref="/app/matches"
        actionLabel="Marcar jogo"
        description="Quando a próxima partida entrar na agenda, ela vira o destaque principal do painel."
        title="Sem jogo marcado"
      />
    );
  }

  return (
    <Link href={nextMatch.href}>
      <ScoreboardCard
        awayName={nextMatch.awayName}
        awayScore={nextMatch.match.away.score}
        eyebrow="Próximo jogo"
        homeName={nextMatch.homeName}
        homeScore={nextMatch.match.home.score}
        match={nextMatch.match}
        status={nextMatch.match.status}
        {...(nextMatch.tournament ? { tournament: nextMatch.tournament } : {})}
      />
    </Link>
  );
}
