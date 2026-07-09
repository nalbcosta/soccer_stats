import { Activity, CalendarDays, MailPlus, Trophy } from "lucide-react";
import type { DashboardResponse } from "../../lib/api";
import { FormDots } from "../sports/form-dots";
import { MatchStatusChip } from "../sports/match-status-chip";
import { StatTile } from "../sports/stat-tile";
import { Card } from "../ui/card";

export function MatchCenterPanel({ dashboard }: { dashboard: DashboardResponse }) {
  const scheduled = dashboard.matches.filter((match) => match.status === "scheduled").length;
  const completed = dashboard.matches.filter((match) => match.status === "completed").length;
  const pendingInvites = dashboard.invites.filter((invite) => invite.status === "pending").length;
  const topTeam = [...dashboard.teams].sort((left, right) => right.stats.points - left.stats.points)[0];
  const latestMatch = [...dashboard.matches].sort(
    (left, right) => new Date(right.playedAt).getTime() - new Date(left.playedAt).getTime()
  )[0];

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-field">Central da rodada</p>
          <h2 className="mt-1 text-xl font-black">Leitura rápida do que importa</h2>
        </div>
        {latestMatch ? <MatchStatusChip status={latestMatch.status} /> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile icon={CalendarDays} label="A jogar" value={scheduled} helper="Partidas no radar" tone="primary" />
        <StatTile icon={Trophy} label="Fechados" value={completed} helper="Placares resolvidos" tone="field" />
        <StatTile icon={MailPlus} label="Convites" value={pendingInvites} helper="Pendências da turma" tone="marker" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-muted">Time em destaque</p>
            <p className="mt-1 text-lg font-black">{topTeam?.name ?? "Crie um time para abrir a disputa"}</p>
            <p className="mt-1 text-sm font-semibold text-muted">
              {topTeam ? `${topTeam.stats.points} pts - ${topTeam.stats.goals} gols` : "Ranking, forma e campanha aparecem aqui."}
            </p>
          </div>
          <div className="rounded-lg bg-canvas p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-muted">
              <Activity size={15} />
              Forma
            </div>
            <FormDots form={topTeam?.stats.form ?? []} />
          </div>
        </div>
      </Card>
    </section>
  );
}
