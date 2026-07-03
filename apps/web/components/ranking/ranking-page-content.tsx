"use client";

import { Medal, Trophy } from "lucide-react";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { EmptyState } from "../feedback/empty-state";
import { LoadingState } from "../feedback/loading-state";
import { FormDots } from "../sports/form-dots";
import { Card } from "../ui/card";
import { TeamCrest } from "../ui/team-crest";

export function RankingPageContent() {
  const { dashboard } = useSession();

  if (!dashboard) {
    return <LoadingState label="Atualizando o ranking..." />;
  }

  const teams = [...dashboard.teams].sort((left, right) => right.stats.points - left.stats.points);
  const leader = teams[0];

  return (
    <>
      <PageHeading eyebrow="Quem ta sobrando" title="Ranking da turma" />
      <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
        <section className="grid gap-3">
          {teams.length === 0 ? (
            <EmptyState
              title="Ranking ainda zerado"
              description="Crie times e feche os primeiros placares para abrir a disputa."
              actionHref="/app/teams"
              actionLabel="Criar time"
            />
          ) : (
            teams.map((team, index) => (
              <Card className="p-4" key={team.id}>
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-canvas text-sm font-black text-muted">
                    {index + 1}
                  </span>
                  <TeamCrest name={team.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">{team.name}</p>
                    <p className="text-sm font-semibold text-muted">
                      {team.stats.wins}V - {team.stats.draws}E - {team.stats.losses}D
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tabular-nums">{team.stats.points}</p>
                    <p className="text-[11px] font-black uppercase text-muted">pts</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md bg-canvas p-3">
                  <p className="text-xs font-black uppercase text-muted">Forma</p>
                  <FormDots form={team.stats.form} />
                </div>
              </Card>
            ))
          )}
        </section>

        <aside className="grid content-start gap-4">
          <Card className="field-grid bg-field p-5 text-white">
            <Trophy size={22} />
            <p className="mt-3 text-xs font-black uppercase opacity-80">Lider da resenha</p>
            <p className="mt-1 text-2xl font-black">{leader?.name ?? "Sem lider ainda"}</p>
            <p className="mt-2 text-sm font-semibold opacity-80">
              {leader ? `${leader.stats.points} pontos e ${leader.stats.goals} gols marcados.` : "O topo aparece quando a bola rolar."}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Medal className="text-primary-strong" size={18} />
              <p className="text-xs font-black uppercase text-muted">Criterio atual</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-muted">
              O ranking usa pontos, gols e forma recente como leitura rapida. No proximo ciclo ele pode ganhar filtros por jogadores,
              artilharia e presenca.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
