"use client";

import { useParams } from "next/navigation";
import { findMatch } from "../../lib/entity-lookup";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import { Card } from "../ui/card";
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

  return (
    <>
      <PageHeading eyebrow="Jogo" title={`${home} x ${away}`} />
      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <Card className="p-5">
          <p className="text-sm font-bold uppercase text-muted">Placar</p>
          <p className="mt-3 text-5xl font-black">
            {match.home.score} x {match.away.score}
          </p>
          <p className="mt-3 text-sm text-muted">{new Date(match.playedAt).toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="p-5">
          <p className="mb-3 font-bold">Fechamento</p>
          <CompleteMatchForm match={match} />
        </Card>
      </div>
    </>
  );
}
