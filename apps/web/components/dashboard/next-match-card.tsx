import Link from "next/link";
import type { DashboardResponse } from "../../lib/api";
import { ScoreboardCard } from "../sports/scoreboard-card";
import { Card } from "../ui/card";

export function NextMatchCard({ dashboard }: { dashboard: DashboardResponse }) {
  const nextMatch = dashboard.matches
    .filter((match) => match.status === "scheduled")
    .sort((left, right) => new Date(left.playedAt).getTime() - new Date(right.playedAt).getTime())[0];

  if (!nextMatch) {
    return (
      <Card className="p-4">
        <p className="text-xs font-bold uppercase text-muted">Agenda</p>
        <p className="mt-2 font-extrabold">Sem jogo marcado</p>
        <Link className="mt-3 inline-flex text-sm font-bold text-primary-strong" href="/app/matches">
          Marcar jogo
        </Link>
      </Card>
    );
  }

  const home = dashboard.teams.find((team) => team.id === nextMatch.home.teamId)?.name ?? "Casa";
  const away = dashboard.teams.find((team) => team.id === nextMatch.away.teamId)?.name ?? "Fora";

  return (
    <Link href={`/app/matches/${nextMatch.id}`}>
      <ScoreboardCard
        awayName={away}
        awayScore={nextMatch.away.score}
        eyebrow="Proximo jogo"
        homeName={home}
        homeScore={nextMatch.home.score}
        meta={new Date(nextMatch.playedAt).toLocaleString("pt-BR")}
        status={nextMatch.status}
      />
    </Link>
  );
}
