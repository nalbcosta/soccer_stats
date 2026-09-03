"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Shuffle,
  Trash2,
  Users,
} from "lucide-react";
import {
  balancePickupTeams,
  type PickupDrawResult,
  type PickupParticipant,
  type TeamAthlete,
} from "@soccer-stats/shared";
import { findTeam } from "../../lib/entity-lookup";
import { api } from "../../lib/api";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import {
  SkillFields,
  type SkillDraft,
  type SkillRole,
} from "../profile/athlete-skills-form";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

const blankGuest: SkillDraft = {
  outfield: { pac: 3, sho: 3, pas: 3, dri: 3, def: 3, phy: 3 },
  isGoalkeeper: false,
};
const asInteger = (value: string, minimum: number) =>
  Math.max(
    minimum,
    Number.isFinite(Number(value)) ? Math.floor(Number(value)) : minimum,
  );

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
  const [guestRole, setGuestRole] = useState<SkillRole>("outfield");
  const [teamCount, setTeamCount] = useState(2);
  const [outfieldPlayersPerTeam, setOutfieldPlayersPerTeam] = useState(4);
  const [goalkeepersPerTeam, setGoalkeepersPerTeam] = useState(1);
  const [result, setResult] = useState<PickupDrawResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!team) return;
    setLoading(true);
    void api
      .listTeamAthletes(team.id)
      .then((value) => {
        setAthletes(value.athletes);
        setCanOrganize(value.canOrganize);
      })
      .finally(() => setLoading(false));
  }, [team]);

  const invalidate = () => {
    setResult(null);
    setError(null);
  };
  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
    invalidate();
  };
  const participants = useMemo(
    () => [
      ...selected
        .map((id) => athletes.find((athlete) => athlete.userId === id))
        .filter((athlete): athlete is TeamAthlete =>
          Boolean(athlete?.effectiveSkills),
        )
        .map((athlete) => ({
          id: athlete.userId,
          name: athlete.displayName,
          source: "member" as const,
          outfield: athlete.effectiveSkills!.outfield,
          canPlayOutfield: true,
          isGoalkeeper: athlete.effectiveSkills!.isGoalkeeper,
          ...(athlete.effectiveSkills!.goalkeeper
            ? { goalkeeper: athlete.effectiveSkills!.goalkeeper }
            : {}),
        })),
      ...guests,
    ],
    [athletes, guests, selected],
  );
  const goalkeeperSlots = teamCount * goalkeepersPerTeam;
  const naturalGoalkeepers = participants.filter(
    (participant) => participant.isGoalkeeper && participant.goalkeeper,
  );
  const reservedGoalkeeperIds = new Set(
    naturalGoalkeepers
      .slice(0, goalkeeperSlots)
      .map((participant) => participant.id),
  );
  const filledGoalkeeperSlots = reservedGoalkeeperIds.size;
  const outfieldSlots = teamCount * outfieldPlayersPerTeam;
  const filledOutfieldSlots = Math.min(
    outfieldSlots,
    participants.filter(
      (participant) =>
        !reservedGoalkeeperIds.has(participant.id) &&
        participant.canPlayOutfield !== false,
    ).length,
  );
  const capacity = teamCount * (outfieldPlayersPerTeam + goalkeepersPerTeam);
  const missingParticipants = capacity - filledGoalkeeperSlots - filledOutfieldSlots;
  const missingGoalkeepers = goalkeeperSlots - filledGoalkeeperSlots;
  const missingOutfieldPlayers = outfieldSlots - filledOutfieldSlots;
  const hasFormation = outfieldPlayersPerTeam + goalkeepersPerTeam > 0;
  const minimumOutfieldPlayers = 2 * outfieldPlayersPerTeam;
  const minimumGoalkeepers = 2 * goalkeepersPerTeam;
  const missingMinimumOutfieldPlayers = Math.max(
    0,
    minimumOutfieldPlayers - filledOutfieldSlots,
  );
  const missingMinimumGoalkeepers = Math.max(
    0,
    minimumGoalkeepers - filledGoalkeeperSlots,
  );
  const canDraw =
    hasFormation &&
    missingMinimumOutfieldPlayers === 0 &&
    missingMinimumGoalkeepers === 0;

  const addGuest = () => {
    if (guestName.trim().length < 2) return;
    setGuests((current) => [
      ...current,
      {
        id: `guest-${crypto.randomUUID()}`,
        name: guestName.trim(),
        source: "guest",
        outfield: guestSkills.outfield,
        canPlayOutfield: guestRole !== "goalkeeper",
        isGoalkeeper: guestRole !== "outfield",
        ...(guestRole !== "outfield"
          ? { goalkeeper: guestSkills.goalkeeper }
          : {}),
      },
    ]);
    setGuestName("");
    setGuestSkills(blankGuest);
    setGuestRole("outfield");
    invalidate();
  };
  const draw = () => {
    try {
      setResult(
        balancePickupTeams({
          participants,
          teamCount,
          outfieldPlayersPerTeam,
          goalkeepersPerTeam,
          seed: `${Date.now()}-${Math.random()}`,
        }),
      );
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Não foi possível sortear.",
      );
    }
  };

  if (teamResult.status === "loading" || loading) return <LoadingState />;
  if (!team)
    return <NotFoundPanel title="Time não encontrado" backHref="/app/teams" />;
  if (!canOrganize)
    return (
      <NotFoundPanel
        title="Somente owner, admin ou capitão pode organizar a pelada"
        backHref={`/app/teams/${team.slug}`}
      />
    );

  return (
    <>
      <PageHeading eyebrow={team.name} title="Sortear pelada" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-4">
          <Card className="p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberStepper
                label="Times"
                minimum={2}
                value={teamCount}
                onChange={(value) => {
                  setTeamCount(value);
                  invalidate();
                }}
              />
              <NumberStepper
                label="Jogadores"
                minimum={0}
                value={outfieldPlayersPerTeam}
                onChange={(value) => {
                  setOutfieldPlayersPerTeam(value);
                  invalidate();
                }}
              />
              <NumberStepper
                label="Goleiros"
                minimum={0}
                value={goalkeepersPerTeam}
                onChange={(value) => {
                  setGoalkeepersPerTeam(value);
                  invalidate();
                }}
              />
            </div>
            {!hasFormation ? (
              <p className="mt-3 text-sm font-bold text-error">
                Informe ao menos uma vaga por time.
              </p>
            ) : null}
          </Card>
          <section>
            <h2 className="font-black">Quem está disponível?</h2>
            <p className="mb-3 text-sm text-muted">
              Selecione atletas avaliados ou inclua convidados. Goleiros
              naturais ocupam primeiro as vagas de gol.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {athletes.map((athlete) => (
                <label
                  className={`flex min-h-14 items-center gap-3 rounded-lg border p-3 ${athlete.effectiveSkills ? "border-border bg-surface" : "border-warning/40 bg-warning-soft"}`}
                  key={athlete.userId}
                >
                  <input
                    checked={selected.includes(athlete.userId)}
                    disabled={!athlete.effectiveSkills}
                    type="checkbox"
                    onChange={() => toggle(athlete.userId)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-bold">
                      {athlete.displayName}
                    </span>
                    <span className="text-xs text-muted">
                      {athlete.effectiveSkills
                        ? `${athlete.effectiveSkills.isGoalkeeper ? "Goleiro • " : "Linha • "}avaliação completa`
                        : "Avaliação pendente"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
          <Card className="p-4">
            <h2 className="font-black">Adicionar convidado</h2>
            <p className="mb-4 text-sm text-muted">
              O convidado existe somente neste sorteio.
            </p>
            <Input
              placeholder="Nome do convidado"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
            <div className="mt-4">
              <fieldset className="grid gap-2 sm:grid-cols-3">
                <legend className="mb-2 text-sm font-bold">
                  Posição do convidado
                </legend>
                {(
                  [
                    ["outfield", "Jogador"],
                    ["goalkeeper", "Apenas goleiro"],
                    ["both", "Jogador e goleiro"],
                  ] as const
                ).map(([role, label]) => (
                  <label
                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-bold ${guestRole === role ? "border-primary bg-primary-soft" : "border-border bg-canvas"}`}
                    key={role}
                  >
                    <input
                      checked={guestRole === role}
                      name="guest-role"
                      type="radio"
                      value={role}
                      onChange={() => {
                        setGuestRole(role);
                        setGuestSkills((current) =>
                          role === "outfield"
                            ? { ...current, isGoalkeeper: false }
                            : {
                                ...current,
                                isGoalkeeper: true,
                                goalkeeper: current.goalkeeper ?? {
                                  div: 3,
                                  han: 3,
                                  kic: 3,
                                  ref: 3,
                                  spd: 3,
                                  pos: 3,
                                },
                              },
                        );
                      }}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              <div className="mt-4">
                <SkillFields
                  role={guestRole}
                  value={guestSkills}
                  onChange={setGuestSkills}
                />
              </div>
            </div>
            <Button
              className="mt-4"
              disabled={guestName.trim().length < 2}
              type="button"
              variant="secondary"
              onClick={addGuest}
            >
              <Plus size={17} />
              Adicionar convidado
            </Button>
            {guests.length ? (
              <div className="mt-4 grid gap-2">
                {guests.map((guest) => (
                  <div
                    className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2"
                    key={guest.id}
                  >
                    <span className="font-bold">{guest.name}</span>
                    <span className="mr-auto ml-2 text-xs text-muted">
                      {guest.canPlayOutfield === false
                        ? "Goleiro"
                        : guest.isGoalkeeper
                          ? "Jogador e goleiro"
                          : "Jogador"}
                    </span>
                    <Button
                      className="min-h-9 px-2"
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setGuests((current) =>
                          current.filter((item) => item.id !== guest.id),
                        );
                        invalidate();
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>
        <aside className="grid content-start gap-3 xl:sticky xl:top-24">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users size={18} />
              <p className="font-black">Resumo</p>
            </div>
            <p className="mt-3 text-3xl font-black">{participants.length}</p>
            <p className="text-sm text-muted">
              participantes • capacidade {capacity}
            </p>
            <p className="mt-2 text-xs text-muted">
              {teamCount} times • {outfieldPlayersPerTeam} na linha e{" "}
              {goalkeepersPerTeam} no gol por time
            </p>
            {false && missingParticipants ? (
              <p className="mt-3 text-sm font-bold text-warning">
                {missingParticipants} vaga(s) ficarão abertas para completar
                depois.
              </p>
            ) : null}
            {false && missingGoalkeepers ? (
              <p className="mt-2 text-sm font-bold text-warning">
                Faltam {missingGoalkeepers} goleiro(s) natural(is).
              </p>
            ) : null}
            {false && missingOutfieldPlayers ? (
              <p className="mt-1 text-sm font-bold text-warning">
                Faltam {missingOutfieldPlayers} jogador(es) de linha.
              </p>
            ) : null}
            {!canDraw && hasFormation ? (
              <p className="mt-3 text-sm font-bold text-error">
                Para sortear, complete ao menos 2 times: faltam{" "}
                {[
                  missingMinimumOutfieldPlayers
                    ? `${missingMinimumOutfieldPlayers} jogador(es) de linha`
                    : null,
                  missingMinimumGoalkeepers
                    ? `${missingMinimumGoalkeepers} goleiro(s)`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" e ")}
                .
              </p>
            ) : null}
            <Button
              className="mt-4 w-full"
              disabled={!canDraw}
              type="button"
              onClick={draw}
            >
              <Shuffle size={18} />
              {result ? "Sortear novamente" : "Sortear times"}
            </Button>
            {error ? (
              <p className="mt-3 text-sm font-bold text-error">{error}</p>
            ) : null}
          </Card>
          {result ? <DrawResult result={result} /> : null}
        </aside>
      </div>
    </>
  );
}

function NumberStepper({
  label,
  minimum,
  value,
  onChange,
}: {
  label: string;
  minimum: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <div className="flex overflow-hidden rounded-lg border border-border bg-surface">
        <Input
          aria-label={label}
          className="min-h-10 rounded-none border-0 text-center [appearance:textfield]"
          min={minimum}
          type="number"
          value={value}
          onChange={(event) => onChange(asInteger(event.target.value, minimum))}
        />
        <div className="flex w-10 flex-col border-l border-border">
          <button
            aria-label={`Aumentar ${label}`}
            className="grid flex-1 place-items-center hover:bg-canvas"
            type="button"
            onClick={() => onChange(value + 1)}
          >
            <ChevronUp size={15} />
          </button>
          <button
            aria-label={`Diminuir ${label}`}
            className="grid flex-1 place-items-center border-t border-border hover:bg-canvas"
            disabled={value <= minimum}
            type="button"
            onClick={() => onChange(value - 1)}
          >
            <ChevronDown size={15} />
          </button>
        </div>
      </div>
    </label>
  );
}

function DrawResult({ result }: { result: PickupDrawResult }) {
  return (
    <div className="grid gap-3">
      <p className="text-xs font-black uppercase text-field">Resultado</p>
      {result.teams.map((team) => (
        <Card className="p-3" key={team.index}>
          <div className="flex justify-between gap-2">
            <p className="font-black">Time {team.index + 1}</p>
            <span className="text-xs font-black">
              Força {team.estimatedStrength.toFixed(2)}
            </span>
          </div>
          {team.goalkeepers.length ? (
            <p className="mt-2 text-xs font-black text-primary-strong">
              GOL:{" "}
              {team.goalkeepers
                .map((participant) => participant.name)
                .join(", ")}
            </p>
          ) : null}
          <ol className="mt-2 grid gap-1 text-sm">
            {team.outfieldPlayers.map((participant) => (
              <li key={participant.id}>
                {participant.name}{" "}
                <span className="text-xs text-muted">• linha</span>
              </li>
            ))}
          </ol>
          {false && (team.goalkeeperVacancies || team.outfieldVacancies) ? (
            <p className="mt-3 text-xs font-bold text-warning">
              Completar:{" "}
              {[
                team.goalkeeperVacancies
                  ? `${team.goalkeeperVacancies} goleiro(s)`
                  : null,
                team.outfieldVacancies
                  ? `${team.outfieldVacancies} jogador(es) de linha`
                  : null,
              ]
                .filter(Boolean)
                .join(" e ")}
            </p>
          ) : null}
        </Card>
      ))}
      <p className="text-xs font-semibold text-muted">
        Diferença estimada: {result.strengthDifference.toFixed(2)}
      </p>
      {result.excluded.length ? (
        <Card className="border-warning/40 p-3">
          <p className="font-black">Fora do sorteio</p>
          <p className="mt-1 text-sm">
            {result.excluded.map((item) => item.name).join(", ")}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
