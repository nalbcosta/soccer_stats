"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { findTeam } from "../../lib/entity-lookup";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import { Card } from "../ui/card";
import { InviteMemberForm } from "./invite-member-form";
import { TeamSocialPanel } from "./team-social-panel";
import { TeamAthletesPanel } from "./team-athletes-panel";
import Link from "next/link";
import { Shuffle } from "lucide-react";

export function TeamDetail() {
  const params = useParams<{ teamId: string }>();
  const router = useRouter();
  const { dashboard, refresh, user } = useSession();
  const result = findTeam(dashboard, params.teamId);
  const canonicalSlug = result.status === "found" ? result.entity.slug : null;

  useEffect(() => {
    if (canonicalSlug && params.teamId !== canonicalSlug) {
      router.replace(`/app/teams/${canonicalSlug}`);
    }
  }, [canonicalSlug, params.teamId, router]);

  if (result.status === "loading") {
    return <LoadingState />;
  }

  if (result.status === "not-found") {
    return <NotFoundPanel title="Time nao encontrado" backHref="/app/teams" />;
  }

  const team = result.entity;
  const membership = team.members.find((member) => member.userId === user?.id);
  const canManage = membership?.role === "owner" || membership?.role === "admin";

  return (
    <>
      <PageHeading eyebrow="Time" title={team.name} action={canManage || membership?.role === "captain" ? <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-white" href={`/app/teams/${team.slug}/pelada`}><Shuffle size={17} />Sortear pelada</Link> : undefined} />
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
        <section className="lg:col-span-2"><TeamAthletesPanel team={team} /></section>
        {user && <section className="lg:col-span-2"><TeamSocialPanel canManage={canManage} onTeamChange={refresh} team={team} /></section>}
      </div>
    </>
  );
}
