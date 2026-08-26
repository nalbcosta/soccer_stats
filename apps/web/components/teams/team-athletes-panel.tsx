"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Star, X } from "lucide-react";
import type { Team, TeamAthlete } from "@soccer-stats/shared";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { BottomSheet } from "../overlays/bottom-sheet";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { SkillFields, type SkillDraft } from "../profile/athlete-skills-form";

const defaultDraft: SkillDraft = { outfield: { pac: 3, sho: 3, pas: 3, dri: 3, def: 3, phy: 3 }, isGoalkeeper: false };

export function TeamAthletesPanel({ team }: { team: Team }) {
  const { setFeedback, user } = useSession();
  const [athletes, setAthletes] = useState<TeamAthlete[]>([]);
  const [canOrganize, setCanOrganize] = useState(false);
  const [editing, setEditing] = useState<TeamAthlete | null>(null);
  const [draft, setDraft] = useState<SkillDraft>(defaultDraft);
  const load = useCallback(async () => { const result = await api.listTeamAthletes(team.id); setAthletes(result.athletes); setCanOrganize(result.canOrganize); }, [team.id]);

  useEffect(() => { void load(); }, [load]);

  const open = (athlete: TeamAthlete) => {
    setEditing(athlete);
    const skills = athlete.effectiveSkills;
    setDraft(skills ? { outfield: skills.outfield, isGoalkeeper: skills.isGoalkeeper, ...(skills.goalkeeper ? { goalkeeper: skills.goalkeeper } : {}) } : defaultDraft);
  };
  const save = async () => {
    if (!editing) return;
    const isChangeRequest = editing.userId === user?.id && editing.hasSkillOverride && !canOrganize;
    await api.updateTeamAthleteSkills(team.id, editing.userId, draft);
    setFeedback(isChangeRequest ? "Pedido de alteração enviado para aprovação do administrador." : "Avaliação atualizada para este time.");
    setEditing(null);
    await load();
  };
  const review = async (athlete: TeamAthlete, decision: "approve" | "reject") => {
    if (!athlete.skillChangeRequest) return;
    await api.reviewTeamAthleteSkillChange(team.id, athlete.userId, athlete.skillChangeRequest.id, decision);
    setFeedback(decision === "approve" ? "Alteração aprovada." : "Solicitação recusada.");
    await load();
  };

  return (
    <section>
      <div className="mb-3"><p className="text-sm font-bold uppercase text-muted">Elenco</p><p className="text-sm text-muted">A primeira avaliação é feita pelo atleta. Depois, alterações pedidas por atletas aguardam a aprovação do administrador.</p></div>
      <div className="grid gap-2 sm:grid-cols-2">
        {athletes.map((athlete) => {
          const canEdit = canOrganize;
          const isCurrentAthlete = athlete.userId === user?.id;
          const hasPendingRequest = athlete.skillChangeRequest?.status === "pending";
          return <Card className="p-3" key={athlete.userId}>
            <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{athlete.displayName}</p><p className="text-sm text-muted">{athlete.role}</p></div><div className="flex items-center gap-2">{canEdit ? <Button aria-label={`Editar avaliação de ${athlete.displayName}`} className="min-h-8 px-2" type="button" variant="ghost" onClick={() => open(athlete)}><Pencil size={15} /><span className="hidden sm:inline">Editar</span></Button> : null}{athlete.effectiveSkills ? <span className="inline-flex items-center gap-1 rounded-md bg-warning-soft px-2 py-1 text-xs font-black"><Star fill="currentColor" size={13} />{average(athlete.effectiveSkills.outfield).toFixed(1)}</span> : <span className="rounded-md bg-warning-soft px-2 py-1 text-xs font-black text-warning">Avaliação pendente</span>}</div></div>
            {athlete.effectiveSkills ? <SkillStars attributes={athlete.effectiveSkills.outfield} /> : null}
            {isCurrentAthlete && hasPendingRequest ? <p className="mt-2 text-xs font-semibold text-warning">Sua alteração está aguardando aprovação.</p> : null}
            {!canOrganize && isCurrentAthlete && !hasPendingRequest ? <div className="mt-3"><Button className="min-h-9 px-3" type="button" variant="secondary" onClick={() => open(athlete)}><Pencil size={15} />{athlete.hasSkillOverride ? "Pedir alteração" : "Fazer minha avaliação"}</Button></div> : null}
            {canOrganize && hasPendingRequest ? <div className="mt-3 flex gap-2"><Button className="min-h-9 px-3" type="button" onClick={() => void review(athlete, "approve")}><Check size={15} />Aprovar</Button><Button className="min-h-9 px-3" type="button" variant="ghost" onClick={() => void review(athlete, "reject")}><X size={15} />Recusar</Button></div> : null}
          </Card>;
        })}
      </div>
      <BottomSheet open={Boolean(editing)} title={editing?.userId === user?.id ? "Minha avaliação no time" : `Avaliar ${editing?.displayName ?? "atleta"}`} description="Esta avaliação valerá apenas para os sorteios deste time." onClose={() => setEditing(null)}>
        <SkillFields value={draft} onChange={setDraft} /><Button className="mt-5 w-full" type="button" onClick={() => void save()}>Salvar avaliação</Button>
      </BottomSheet>
    </section>
  );
}

function average(attributes: object) { const values = Object.values(attributes) as number[]; return values.reduce((sum, value) => sum + value, 0) / values.length; }

function SkillStars({ attributes }: { attributes: { pac: number; sho: number; pas: number; dri: number; def: number; phy: number } }) {
  const labels: Record<string, string> = { pac: "RIT", sho: "FIN", pas: "PAS", dri: "DRI", def: "DEF", phy: "FÍS" };
  return <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:grid-cols-3">{Object.entries(attributes).map(([key, value]) => <div className="flex items-center justify-between gap-1" key={key}><span className="font-bold text-muted">{labels[key] ?? key.toUpperCase()}</span><span className="flex text-warning">{Array.from({ length: 5 }, (_, index) => <Star className={index < value ? "fill-current" : "fill-transparent text-border"} key={index} size={12} />)}</span></div>)}</div>;
}
