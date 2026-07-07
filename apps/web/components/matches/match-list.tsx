"use client";

import Link from "next/link";
import { useSession } from "../app/session-provider";
import { EmptyState } from "../feedback/empty-state";
import { LoadingState } from "../feedback/loading-state";
import { ScoreboardCard } from "../sports/scoreboard-card";

export function MatchList() {
  const { dashboard } = useSession();

  if (!dashboard) {
    return <LoadingState label="Montando a tabela de jogos..." />;
  }

  if (dashboard.matches.length === 0) {
    return <EmptyState title="Nenhum jogo marcado" description="Escolha dois times e marque a primeira partida." />;
  }

  return (
    <div className="grid gap-3">
      {dashboard.matches.map((match) => {
        const home = dashboard.teams.find((team) => team.id === match.home.teamId)?.name ?? "Casa";
        const away = dashboard.teams.find((team) => team.id === match.away.teamId)?.name ?? "Fora";
        const tournament = match.tournamentId ? dashboard.tournaments.find((item) => item.id === match.tournamentId) : undefined;

        return (
          <Link href={`/app/matches/${match.id}`} key={match.id}>
            <ScoreboardCard
              awayName={away}
              awayScore={match.away.score}
              homeName={home}
              homeScore={match.home.score}
              match={match}
              meta={new Date(match.playedAt).toLocaleString("pt-BR")}
              status={match.status}
              {...(tournament ? { tournament } : {})}
            />
          </Link>
        );
      })}
    </div>
  );
}
