"use client";

import { useEffect, useState } from "react";
import { Save, Star } from "lucide-react";
import type { AthleteSkillProfile, GoalkeeperAttributes, OutfieldAttributes } from "@soccer-stats/shared";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";

const defaultOutfield: OutfieldAttributes = { pac: 3, sho: 3, pas: 3, dri: 3, def: 3, phy: 3 };
const defaultGoalkeeper: GoalkeeperAttributes = { div: 3, han: 3, kic: 3, ref: 3, spd: 3, pos: 3 };
const outfieldLabels: Record<keyof OutfieldAttributes, string> = { pac: "Ritmo (PAC)", sho: "Finalização (SHO)", pas: "Passe (PAS)", dri: "Drible (DRI)", def: "Defesa (DEF)", phy: "Físico (PHY)" };
const goalkeeperLabels: Record<keyof GoalkeeperAttributes, string> = { div: "Mergulho (DIV)", han: "Jogo de mãos (HAN)", kic: "Pontapé (KIC)", ref: "Reflexos (REF)", spd: "Velocidade (SPD)", pos: "Posicionamento (POS)" };

export interface SkillDraft {
  outfield: OutfieldAttributes;
  isGoalkeeper: boolean;
  goalkeeper?: GoalkeeperAttributes;
}

export type SkillRole = "outfield" | "goalkeeper" | "both";

export function SkillFields({ value, onChange, role }: { value: SkillDraft; onChange: (value: SkillDraft) => void; role?: SkillRole }) {
  const showsOutfield = role !== "goalkeeper";
  const showsGoalkeeper = role ? role !== "outfield" : value.isGoalkeeper;
  return (
    <div className="grid gap-5">
      {showsOutfield ? <AttributeGroup labels={outfieldLabels} values={value.outfield} onChange={(key, rating) => onChange({ ...value, outfield: { ...value.outfield, [key]: rating } })} /> : null}
      {!role ? <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-canvas px-3 font-bold">
        <input checked={value.isGoalkeeper} type="checkbox" onChange={(event) => { const { goalkeeper: _ignored, ...base } = value; onChange(event.target.checked ? { ...base, isGoalkeeper: true, goalkeeper: value.goalkeeper ?? defaultGoalkeeper } : { ...base, isGoalkeeper: false }); }} />
        Também sou goleiro
      </label> : null}
      {showsGoalkeeper ? <AttributeGroup labels={goalkeeperLabels} values={value.goalkeeper ?? defaultGoalkeeper} onChange={(key, rating) => onChange({ ...value, isGoalkeeper: true, goalkeeper: { ...(value.goalkeeper ?? defaultGoalkeeper), [key]: rating } })} /> : null}
    </div>
  );
}

function AttributeGroup<T extends object>({ labels, values, onChange }: { labels: Record<keyof T, string>; values: T; onChange: (key: keyof T, value: number) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2">{(Object.keys(labels) as Array<keyof T>).map((key) => (
    <div className="rounded-lg border border-border p-3" key={String(key)}>
      <p className="text-sm font-bold">{labels[key]}</p>
      <div className="mt-2 grid grid-cols-5 gap-1" role="radiogroup" aria-label={labels[key]}>
        {[1, 2, 3, 4, 5].map((rating) => <button aria-label={`${rating} estrelas`} aria-checked={(values[key] as number) === rating} className="grid min-h-9 min-w-0 place-items-center rounded-md p-0.5 text-warning hover:bg-warning-soft" key={rating} role="radio" type="button" onClick={() => onChange(key, rating)}><Star className="max-w-full" fill={rating <= (values[key] as number) ? "currentColor" : "none"} size={19} /></button>)}
      </div>
    </div>
  ))}</div>;
}

export function AthleteSkillsForm({ required = false }: { required?: boolean }) {
  const { refresh, setFeedback } = useSession();
  const [skills, setSkills] = useState<AthleteSkillProfile | null>(null);
  const [draft, setDraft] = useState<SkillDraft>({ outfield: defaultOutfield, isGoalkeeper: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    void api.getMySkills()
      .then(({ skills: value }) => { if (!active) return; setSkills(value); if (value) setDraft({ outfield: value.outfield, isGoalkeeper: value.isGoalkeeper, ...(value.goalkeeper ? { goalkeeper: value.goalkeeper } : {}) }); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const save = async () => { setSaving(true); try { const { skills: value } = await api.updateMySkills(draft); setSkills(value); await refresh(); setFeedback("Avaliação esportiva salva."); } catch (error) { setFeedback(error instanceof Error ? error.message : "Não foi possível salvar.", "error"); } finally { setSaving(false); } };
  return (
    <section className={`rounded-xl border p-4 sm:p-5 ${required && !skills ? "border-warning bg-warning-soft" : "border-border bg-surface"}`}>
      <div className="mb-5"><p className="text-xs font-black uppercase text-field">Nível do atleta</p><h2 className="mt-1 text-lg font-black">Seus atributos em estrelas</h2><p className="mt-1 text-sm text-muted">{required && !skills ? "Preencha para participar dos sorteios do time." : "Esta avaliação é separada do Card calculado pelas partidas."}</p></div>
      {loading ? <p className="text-sm text-muted">Carregando atributos...</p> : <><SkillFields value={draft} onChange={setDraft} /><Button className="mt-5 w-full sm:w-auto" disabled={saving} type="button" onClick={() => void save()}><Save size={17} />{saving ? "Salvando..." : "Salvar atributos"}</Button></>}
    </section>
  );
}
