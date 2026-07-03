"use client";

import { useParams } from "next/navigation";
import { findTeam } from "../../lib/entity-lookup";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import { Card } from "../ui/card";
import { InviteMemberForm } from "./invite-member-form";

export function TeamDetail() {
  const params = useParams<{ teamId: string }>();
  const { dashboard } = useSession();
  const result = findTeam(dashboard, params.teamId);

  if (result.status === "loading") {
    return <LoadingState />;
  }

  if (result.status === "not-found") {
    return <NotFoundPanel title="Time nao encontrado" backHref="/app/teams" />;
  }

  const team = result.entity;

  return (
    <>
      <PageHeading eyebrow="Time" title={team.name} />
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-sm text-muted">Pontos</p>
            <p className="mt-1 text-3xl font-black">{team.stats.points}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted">Gols</p>
            <p className="mt-1 text-3xl font-black">{team.stats.goals}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted">Aproveitamento</p>
            <p className="mt-1 text-3xl font-black">{team.stats.winRate}%</p>
          </Card>
        </section>
        <section className="rounded-lg border border-border bg-surface p-4">
          <p className="font-bold">Convidar jogador</p>
          <div className="mt-3">
            <InviteMemberForm teamId={team.id} />
          </div>
        </section>
        <section className="lg:col-span-2">
          <p className="mb-3 text-sm font-bold uppercase text-muted">Elenco</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {team.members.map((member) => (
              <Card className="p-3" key={member.userId}>
                <p className="font-bold">{member.userId}</p>
                <p className="text-sm text-muted">{member.role}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
