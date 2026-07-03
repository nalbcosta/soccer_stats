"use client";

import { useParams } from "next/navigation";
import { findTournament } from "../../lib/entity-lookup";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import { TournamentTable } from "./tournament-table";

export function TournamentDetail() {
  const params = useParams<{ tournamentId: string }>();
  const { dashboard } = useSession();
  const result = findTournament(dashboard, params.tournamentId);

  if (result.status === "loading") {
    return <LoadingState />;
  }

  if (result.status === "not-found") {
    return <NotFoundPanel title="Copa nao encontrada" backHref="/app/tournaments" />;
  }

  const tournament = result.entity;
  const teams = dashboard?.teams.filter((team) => tournament.teamIds.includes(team.id)) ?? [];

  return (
    <>
      <PageHeading eyebrow="Copa" title={tournament.name} />
      <TournamentTable tournament={tournament} teams={teams} />
    </>
  );
}
