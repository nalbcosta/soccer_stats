"use client";

import { buildPerformanceMetrics, createEmptyStats } from "@soccer-stats/shared";
import { Activity, BarChart3, Gauge, Target, Trophy } from "lucide-react";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { ComparisonBar } from "../sports/comparison-bar";
import { FormDots } from "../sports/form-dots";
import { StatTile } from "../sports/stat-tile";
import { Card } from "../ui/card";
import { TeamCrest } from "../ui/team-crest";

export function StatsPageContent() {
  const { dashboard } = useSession();

  if (!dashboard) {
    return <LoadingState label="Puxando os números..." />;
  }

  const profileStats = dashboard.profile?.stats ?? createEmptyStats();
  const profileMetrics = buildPerformanceMetrics(profileStats);
  const totalGoals = dashboard.teams.reduce((total, team) => total + team.stats.goals, 0);
  const totalPoints = dashboard.teams.reduce((total, team) => total + team.stats.points, 0);
  const completedMatches = dashboard.matches.filter((match) => match.status === "completed").length;
  const topAttackTeams = [...dashboard.teams].sort((left, right) => right.stats.goals - left.stats.goals).slice(0, 5);
  const topConsistencyTeams = [...dashboard.teams]
    .sort((left, right) => buildPerformanceMetrics(right.stats).consistency - buildPerformanceMetrics(left.stats).consistency)
    .slice(0, 5);
  const maxGoals = Math.max(...topAttackTeams.map((team) => team.stats.goals), 0);
  const maxConsistency = Math.max(...topConsistencyTeams.map((team) => buildPerformanceMetrics(team.stats).consistency), 0);

  return (
    <>
      <PageHeading eyebrow="Números da resenha" title="Estatísticas" />
      <div className="grid gap-4">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={BarChart3} label="Jogos fechados" value={completedMatches} helper="Placares finalizados" tone="primary" />
          <StatTile icon={Target} label="Gols dos times" value={totalGoals} helper="Volume ofensivo" tone="field" />
          <StatTile icon={Trophy} label="Pontos somados" value={totalPoints} helper="Campanha geral" tone="marker" />
          <StatTile
            icon={Activity}
            label="Seu aproveit."
            value={`${profileStats.winRate}%`}
            helper="Recorte do seu card"
            tone="primary"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-4">
            <p className="text-xs font-black uppercase text-muted">Seu desempenho</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Mini label="Jogos" value={profileStats.matchesPlayed} />
              <Mini label="Gols" value={profileStats.goals} />
              <Mini label="Assists" value={profileStats.assists} />
              <Mini label="Saldo" value={profileStats.goalDifference} />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md bg-canvas p-3">
              <p className="text-xs font-black uppercase text-muted">Forma recente</p>
              <FormDots form={profileStats.form} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Gauge className="text-primary-strong" size={18} />
              <p className="text-xs font-black uppercase text-muted">Métricas avançadas</p>
            </div>
            <div className="mt-4 grid gap-3">
              <MetricLine label="Contribuição ofensiva" value={profileMetrics.offensiveContribution} suffix="/jogo" />
              <MetricLine label="Consistência" value={profileMetrics.consistency} suffix="/99" />
              <MetricLine label="Pontos por jogo" value={profileMetrics.pointsPerMatch} suffix="ppj" />
              <MetricLine label="Balanço de resultado" value={profileMetrics.resultBalance} />
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <p className="text-xs font-black uppercase text-muted">Ataque dos times</p>
            <div className="mt-4 grid gap-4">
              {topAttackTeams.length === 0 ? (
                <p className="text-sm font-semibold text-muted">Feche placares para comparar volume ofensivo.</p>
              ) : (
                topAttackTeams.map((team) => (
                  <TeamComparisonRow
                    helper={`${team.stats.goalsPerMatch} gols por jogo`}
                    key={team.id}
                    max={maxGoals}
                    name={team.name}
                    tone="field"
                    value={team.stats.goals}
                  />
                ))
              )}
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-black uppercase text-muted">Consistência</p>
            <div className="mt-4 grid gap-4">
              {topConsistencyTeams.length === 0 ? (
                <p className="text-sm font-semibold text-muted">A regularidade aparece quando os times acumulam jogos.</p>
              ) : (
                topConsistencyTeams.map((team) => {
                  const metrics = buildPerformanceMetrics(team.stats);

                  return (
                    <TeamComparisonRow
                      helper={`${team.stats.winRate}% de aproveitamento`}
                      key={team.id}
                      max={maxConsistency}
                      name={team.name}
                      tone="primary"
                      value={metrics.consistency}
                    />
                  );
                })
              )}
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}

function MetricLine({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-canvas p-3">
      <p className="text-sm font-black">{label}</p>
      <p className="text-sm font-black tabular-nums text-primary-strong">
        {value}
        {suffix ? <span className="ml-1 text-xs uppercase text-muted">{suffix}</span> : null}
      </p>
    </div>
  );
}

function TeamComparisonRow({
  name,
  value,
  max,
  helper,
  tone
}: {
  name: string;
  value: number;
  max: number;
  helper: string;
  tone: "primary" | "field" | "marker";
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
      <TeamCrest className="h-9 w-9 text-xs" name={name} />
      <ComparisonBar helper={helper} label={name} max={max} tone={tone} value={value} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-canvas p-3">
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-xs font-black uppercase text-muted">{label}</p>
    </div>
  );
}
