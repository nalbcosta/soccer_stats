"use client";

import { CalendarDays, Flame, Trophy, Users, type LucideIcon } from "lucide-react";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { Card } from "../ui/card";
import { RankingList } from "../sports/ranking-list";
import { MatchCenterPanel } from "./match-center-panel";
import { NextMatchCard } from "./next-match-card";
import { PlayerSummaryCard } from "./player-summary-card";

export function DashboardOverview() {
  const { dashboard, user } = useSession();

  if (!dashboard || !user) {
    return <LoadingState />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="grid gap-4">
        <section className="grid gap-3 sm:grid-cols-3">
          <MetricCard helper="Elencos ativos" icon={Users} label="Times" value={dashboard.teams.length} />
          <MetricCard helper="Na agenda da turma" icon={CalendarDays} label="Jogos" value={dashboard.matches.length} />
          <MetricCard helper="Disputa valendo taça" icon={Trophy} label="Copas" value={dashboard.tournaments.length} />
        </section>
        <NextMatchCard dashboard={dashboard} />
        <MatchCenterPanel dashboard={dashboard} />
        <section className="rounded-lg border border-border bg-surface p-4 shadow-line">
          <div className="flex items-center gap-2 text-primary-strong">
            <Flame size={18} />
            <p className="text-xs font-black uppercase text-muted">Momento da rodada</p>
          </div>
          <p className="mt-2 text-xl font-black">
            {dashboard.profile?.stats.recentHighlight ?? "Primeiro jogo ainda vai sair."}
          </p>
          <p className="mt-1 text-sm font-semibold text-muted">
            O resumo aparece aqui conforme jogos, gols e resultados entram no NaBola.
          </p>
        </section>
        {dashboard.teams.length > 0 ? (
          <section>
            <p className="mb-3 text-xs font-black uppercase text-muted">Ranking dos times</p>
            <RankingList teams={dashboard.teams} />
          </section>
        ) : null}
      </div>
      <PlayerSummaryCard profile={dashboard.profile} user={user} />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Icon className="text-primary-strong" size={20} />
        <span className="rounded-sm bg-primary-soft px-2 py-1 text-[11px] font-black uppercase text-primary-strong">
          {label}
        </span>
      </div>
      <p className="mt-3 text-3xl font-black tabular-nums">{value}</p>
      <p className="text-sm font-semibold text-muted">{helper}</p>
    </Card>
  );
}
