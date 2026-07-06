"use client";

import { useParams } from "next/navigation";
import { findMatch } from "../../lib/entity-lookup";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import { Card } from "../ui/card";
import { ScoreboardCard } from "../sports/scoreboard-card";
import { CompleteMatchForm } from "./complete-match-form";

export function MatchDetail() {
  const params = useParams<{ matchId: string }>();
  const { dashboard } = useSession();
  const result = findMatch(dashboard, params.matchId);

  if (result.status === "loading") {
    return <LoadingState />;
  }

  if (result.status === "not-found") {
    return <NotFoundPanel title="Jogo nao encontrado" backHref="/app/matches" />;
  }

  const match = result.entity;
  const home = dashboard?.teams.find((team) => team.id === match.home.teamId)?.name ?? "Casa";
  const away = dashboard?.teams.find((team) => team.id === match.away.teamId)?.name ?? "Fora";
  const tournament = match.tournamentId ? dashboard?.tournaments.find((item) => item.id === match.tournamentId) : undefined;

  return (
    <>
      <PageHeading eyebrow="Jogo" title={`${home} x ${away}`} />
      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <ScoreboardCard
          awayName={away}
          awayScore={match.away.score}
          homeName={home}
          homeScore={match.home.score}
          match={match}
          status={match.status}
          {...(tournament ? { tournament } : {})}
        />
        <Card className="p-5">
          <p className="mb-3 font-bold">Fechamento</p>
          <CompleteMatchForm match={match} />
        </Card>
      </div>
    </>
  );
}
