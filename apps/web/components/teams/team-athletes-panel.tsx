"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, RotateCcw, Star } from "lucide-react";
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
  const open = (athlete: TeamAthlete) => { setEditing(athlete); const skills = athlete.effectiveSkills; setDraft(skills ? { outfield: skills.outfield, isGoalkeeper: skills.isGoalkeeper, ...(skills.goalkeeper ? { goalkeeper: skills.goalkeeper } : {}) } : defaultDraft); };
  const save = async () => { if (!editing) return; await api.updateTeamAthleteSkills(team.id, editing.userId, draft); setFeedback("Avaliação do time atualizada."); setEditing(null); await load(); };
  const reset = async (athlete: TeamAthlete) => { await api.resetTeamAthleteSkills(team.id, athlete.userId); setFeedback("O time voltou a usar a autoavaliação."); await load(); };
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase text-muted">Elenco</p><p className="text-sm text-muted">As estrelas do time não alteram o Card competitivo.</p></div></div>
      <div className="grid gap-2 sm:grid-cols-2">
        {athletes.map((athlete) => <Card className="p-3" key={athlete.userId}>
          <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{athlete.displayName}</p><p className="text-sm text-muted">{athlete.role}</p></div>{athlete.effectiveSkills ? <span className="inline-flex items-center gap-1 rounded-md bg-warning-soft px-2 py-1 text-xs font-black"><Star fill="currentColor" size={13} />{average(athlete.effectiveSkills.outfield).toFixed(1)}</span> : <span className="rounded-md bg-warning-soft px-2 py-1 text-xs font-black text-warning">Avaliação pendente</span>}</div>
          {athlete.hasSkillOverride && (canOrganize || athlete.userId === user?.id) ? <p className="mt-2 text-xs font-semibold text-primary-strong">Avaliação do time por {athlete.skillOverrideByName ?? "organizador"} em {athlete.skillOverride ? new Intl.DateTimeFormat("pt-BR").format(new Date(athlete.skillOverride.updatedAt)) : "—"}.</p> : null}
          {canOrganize ? <div className="mt-3 flex gap-2"><Button className="min-h-9 px-3" type="button" variant="secondary" onClick={() => open(athlete)}><Pencil size={15} />Avaliar</Button>{athlete.hasSkillOverride ? <Button className="min-h-9 px-3" type="button" variant="ghost" onClick={() => void reset(athlete)}><RotateCcw size={15} />Restaurar</Button> : null}</div> : null}
        </Card>)}
      </div>
      <BottomSheet open={Boolean(editing)} title={`Avaliar ${editing?.displayName ?? "atleta"}`} description="Esta nota valerá apenas para os sorteios deste time." onClose={() => setEditing(null)}>
        <SkillFields value={draft} onChange={setDraft} /><Button className="mt-5 w-full" type="button" onClick={() => void save()}>Salvar avaliação</Button>
      </BottomSheet>
    </section>
  );
}

function average(attributes: object) { const values = Object.values(attributes) as number[]; return values.reduce((sum, value) => sum + value, 0) / values.length; }
