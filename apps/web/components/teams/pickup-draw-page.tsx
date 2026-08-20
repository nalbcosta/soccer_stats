"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Shuffle, Trash2, Users } from "lucide-react";
import { balancePickupTeams, type PickupDrawResult, type PickupParticipant, type TeamAthlete } from "@soccer-stats/shared";
import { findTeam } from "../../lib/entity-lookup";
import { api } from "../../lib/api";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import { SkillFields, type SkillDraft } from "../profile/athlete-skills-form";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

const blankGuest: SkillDraft = { outfield: { pac: 3, sho: 3, pas: 3, dri: 3, def: 3, phy: 3 }, isGoalkeeper: false };

export function PickupDrawPage() {
  const params = useParams<{ teamId: string }>();
  const { dashboard } = useSession();
  const teamResult = findTeam(dashboard, params.teamId);
  const team = teamResult.status === "found" ? teamResult.entity : null;
  const [athletes, setAthletes] = useState<TeamAthlete[]>([]);
  const [canOrganize, setCanOrganize] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [guests, setGuests] = useState<PickupParticipant[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestSkills, setGuestSkills] = useState<SkillDraft>(blankGuest);
  const [teamCount, setTeamCount] = useState(2);
  const [squadSize, setSquadSize] = useState<5 | 6>(5);
  const [venueType, setVenueType] = useState("society");
  const [result, setResult] = useState<PickupDrawResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!team) return; setLoading(true); void api.listTeamAthletes(team.id).then((value) => { setAthletes(value.athletes); setCanOrganize(value.canOrganize); }).finally(() => setLoading(false)); }, [team]);
  const invalidate = () => { setResult(null); setError(null); };
  const toggle = (id: string) => { setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]); invalidate(); };
  const participants = useMemo(() => [
    ...selected.map((id) => athletes.find((athlete) => athlete.userId === id)).filter((athlete): athlete is TeamAthlete => Boolean(athlete?.effectiveSkills)).map((athlete) => ({ id: athlete.userId, name: athlete.displayName, source: "member" as const, outfield: athlete.effectiveSkills!.outfield, isGoalkeeper: athlete.effectiveSkills!.isGoalkeeper, ...(athlete.effectiveSkills!.goalkeeper ? { goalkeeper: athlete.effectiveSkills!.goalkeeper } : {}) })),
    ...guests
  ], [athletes, guests, selected]);
  const addGuest = () => { if (guestName.trim().length < 2) return; setGuests((current) => [...current, { id: `guest-${crypto.randomUUID()}`, name: guestName.trim(), source: "guest", outfield: guestSkills.outfield, isGoalkeeper: guestSkills.isGoalkeeper, ...(guestSkills.goalkeeper ? { goalkeeper: guestSkills.goalkeeper } : {}) }]); setGuestName(""); setGuestSkills(blankGuest); invalidate(); };
  const draw = () => { try { setResult(balancePickupTeams({ participants, teamCount, squadSize, seed: `${Date.now()}-${Math.random()}` })); setError(null); } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível sortear."); } };

  if (teamResult.status === "loading" || loading) return <LoadingState />;
  if (!team) return <NotFoundPanel title="Time não encontrado" backHref="/app/teams" />;
  if (!canOrganize) return <NotFoundPanel title="Somente owner, admin ou capitão pode organizar a pelada" backHref={`/app/teams/${team.slug}`} />;
  return <>
    <PageHeading eyebrow={team.name} title="Sortear pelada" />
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-4">
        <Card className="p-4"><div className="grid gap-3 sm:grid-cols-3"><label className="grid gap-2 text-sm font-bold">Tipo do local<Select value={venueType} onChange={(event) => { setVenueType(event.target.value); invalidate(); }}><option value="court">Quadra</option><option value="field">Campo</option><option value="society">Society</option></Select></label><label className="grid gap-2 text-sm font-bold">Formação<Select value={squadSize} onChange={(event) => { setSquadSize(Number(event.target.value) as 5 | 6); invalidate(); }}><option value={5}>4 na linha + 1 gol</option><option value={6}>5 na linha + 1 gol</option></Select></label><label className="grid gap-2 text-sm font-bold">Quantidade de times<Input min={2} type="number" value={teamCount} onChange={(event) => { setTeamCount(Math.max(2, Number(event.target.value))); invalidate(); }} /></label></div></Card>
        <section><h2 className="font-black">Quem está disponível?</h2><p className="mb-3 text-sm text-muted">A ordem de seleção define quem fica fora se a capacidade for ultrapassada.</p><div className="grid gap-2 sm:grid-cols-2">{athletes.map((athlete) => <label className={`flex min-h-14 items-center gap-3 rounded-lg border p-3 ${athlete.effectiveSkills ? "border-border bg-surface" : "border-warning/40 bg-warning-soft"}`} key={athlete.userId}><input checked={selected.includes(athlete.userId)} disabled={!athlete.effectiveSkills} type="checkbox" onChange={() => toggle(athlete.userId)} /><span className="min-w-0"><span className="block truncate font-bold">{athlete.displayName}</span><span className="text-xs text-muted">{athlete.effectiveSkills ? `${athlete.effectiveSkills.isGoalkeeper ? "Goleiro • " : ""}avaliação completa` : "Avaliação pendente"}</span></span></label>)}</div></section>
        <Card className="p-4"><h2 className="font-black">Adicionar convidado</h2><p className="mb-4 text-sm text-muted">O convidado existe somente neste sorteio.</p><Input placeholder="Nome do convidado" value={guestName} onChange={(event) => setGuestName(event.target.value)} /><div className="mt-4"><SkillFields value={guestSkills} onChange={setGuestSkills} /></div><Button className="mt-4" disabled={guestName.trim().length < 2} type="button" variant="secondary" onClick={addGuest}><Plus size={17} />Adicionar convidado</Button>{guests.length ? <div className="mt-4 grid gap-2">{guests.map((guest) => <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2" key={guest.id}><span className="font-bold">{guest.name}</span><Button className="min-h-9 px-2" type="button" variant="ghost" onClick={() => { setGuests((current) => current.filter((item) => item.id !== guest.id)); invalidate(); }}><Trash2 size={16} /></Button></div>)}</div> : null}</Card>
      </div>
      <aside className="grid content-start gap-3 xl:sticky xl:top-24"><Card className="p-4"><div className="flex items-center gap-2"><Users size={18} /><p className="font-black">Resumo</p></div><p className="mt-3 text-3xl font-black">{participants.length}</p><p className="text-sm text-muted">participantes • capacidade {teamCount * squadSize}</p><Button className="mt-4 w-full" disabled={participants.length < teamCount} type="button" onClick={draw}><Shuffle size={18} />{result ? "Sortear novamente" : "Sortear times"}</Button>{error ? <p className="mt-3 text-sm font-bold text-error">{error}</p> : null}</Card>{result ? <DrawResult result={result} venueType={venueType} /> : null}</aside>
    </div>
  </>;
}

function DrawResult({ result, venueType }: { result: PickupDrawResult; venueType: string }) {
  return <div className="grid gap-3"><p className="text-xs font-black uppercase text-field">Resultado • {venueType === "court" ? "Quadra" : venueType === "field" ? "Campo" : "Society"}</p>{result.teams.map((team) => <Card className="p-3" key={team.index}><div className="flex justify-between gap-2"><p className="font-black">Time {team.index + 1}</p><span className="text-xs font-black">Força {team.estimatedStrength.toFixed(2)}</span></div>{!team.hasNaturalGoalkeeper ? <p className="mt-1 text-xs font-bold text-warning">Sem goleiro natural</p> : null}<ol className="mt-2 grid gap-1 text-sm">{team.participants.map((participant) => <li key={participant.id}>{participant.name}{participant.isGoalkeeper ? " • GOL" : ""}</li>)}</ol></Card>)}<p className="text-xs font-semibold text-muted">Diferença estimada: {result.strengthDifference.toFixed(2)}</p>{result.excluded.length ? <Card className="border-warning/40 p-3"><p className="font-black">Fora do sorteio</p><p className="mt-1 text-sm">{result.excluded.map((item) => item.name).join(", ")}</p></Card> : null}</div>;
}
