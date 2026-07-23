"use client";

import type { Match } from "@soccer-stats/shared";
import { Check, CheckCircle2, Clock3, Plus, Trash2 } from "lucide-react";
import { useMatchSheetEditor, type GoalDraft, type GoalPlayerOption } from "../../composables/use-match-sheet-editor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

export function CompleteMatchForm({ awayName, homeName, match }: { awayName: string; homeName: string; match: Match }) {
  const {
    addGoal,
    derivedScore,
    durationMinutes,
    goals,
    isPending,
    playerOptions,
    removeGoal,
    setDurationMinutes,
    submit,
    updateGoal
  } = useMatchSheetEditor(match, { homeName, awayName });

  if (match.status === "completed") {
    return <p className="rounded-lg bg-field-soft p-3 text-sm font-bold text-field">Placar fechado.</p>;
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <section className="rounded-lg bg-canvas p-3">
        <p className="mb-3 text-xs font-black uppercase text-muted">Placar gerado pela súmula</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <ScoreBox label={homeName} value={derivedScore.homeScore} />
          <span className="font-black">x</span>
          <ScoreBox label={awayName} value={derivedScore.awayScore} />
        </div>
        <label className="mt-3 grid gap-1">
          <span className="text-xs font-black uppercase text-muted">Tempo de jogo</span>
          <Input
            max={180}
            min={1}
            placeholder="Duração final (min)"
            type="number"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
          />
        </label>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Gols da partida</p>
            <p className="text-sm font-semibold text-muted">Cada gol confirmado atualiza o placar acima.</p>
          </div>
          <Button type="button" variant="secondary" onClick={addGoal}>
            <Plus size={16} />
            Gol
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-canvas p-4 text-sm font-semibold text-muted">
            Nenhum gol lançado. Use o botão Gol para montar a súmula.
          </div>
        ) : null}

        {goals.map((goal, index) => (
          <GoalEditor
            awayName={awayName}
            goal={goal}
            homeName={homeName}
            index={index}
            key={index}
            match={match}
            playerOptions={playerOptions}
            onRemove={() => removeGoal(index)}
            onUpdate={(nextGoal) => updateGoal(index, nextGoal)}
          />
        ))}
      </section>
      <Button disabled={isPending || goals.some((goal) => !goal.minute || !goal.playerId)} type="submit">
        <Check size={18} />
        Fechar placar
      </Button>
    </form>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-center shadow-line">
      <p className="truncate text-xs font-black uppercase text-muted">{label}</p>
      <p className="mt-1 text-4xl font-black tabular-nums">{value}</p>
    </div>
  );
}

function GoalEditor({
  awayName,
  goal,
  homeName,
  index,
  match,
  onRemove,
  onUpdate,
  playerOptions
}: {
  awayName: string;
  goal: GoalDraft;
  homeName: string;
  index: number;
  match: Match;
  onRemove: () => void;
  onUpdate: (goal: Partial<GoalDraft>) => void;
  playerOptions: GoalPlayerOption[];
}) {
  const availablePlayers = playerOptions.filter((player) => player.teamId === goal.teamId);
  const scorer = playerOptions.find((player) => player.playerId === goal.playerId);
  const teamName = goal.teamId === match.home.teamId ? homeName : awayName;

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-canvas p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-muted">Gol {index + 1}</p>
          <p className="mt-1 truncate font-black">
            {goal.minute ? `${goal.minute}'` : "Minuto"} • {scorer?.label ?? "Escolha o autor"} • {teamName}
          </p>
        </div>
        <span className={`inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-black ${goal.confirmed ? "bg-success-soft text-success" : "bg-warning-soft text-text"}`}>
          {goal.confirmed ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {goal.confirmed ? "Confirmado" : "Pendente"}
        </span>
      </div>

      <div className="grid gap-2">
        <div className="grid grid-cols-[5rem_1fr] gap-2">
          <Input max={130} min={0} placeholder="Min" type="number" value={goal.minute} onChange={(event) => onUpdate({ minute: event.target.value, confirmed: false })} />
          <Select value={goal.teamId} onChange={(event) => onUpdate({ teamId: event.target.value, playerId: "", assistPlayerId: "", confirmed: false })}>
            <option value={match.home.teamId}>{homeName}</option>
            <option value={match.away.teamId}>{awayName}</option>
          </Select>
        </div>
        <Select value={goal.playerId} onChange={(event) => onUpdate({ playerId: event.target.value, confirmed: false })}>
          <option value="">Quem fez o gol?</option>
          {availablePlayers.map((player) => (
            <option key={player.playerId} value={player.playerId}>
              {player.label} • {player.teamName}
            </option>
          ))}
        </Select>
        <Select value={goal.assistPlayerId} onChange={(event) => onUpdate({ assistPlayerId: event.target.value, confirmed: false })}>
          <option value="">Sem assistência</option>
          {availablePlayers
            .filter((player) => player.playerId !== goal.playerId)
            .map((player) => (
              <option key={player.playerId} value={player.playerId}>
                {player.label} • {player.teamName}
              </option>
            ))}
        </Select>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button disabled={!goal.minute || !goal.playerId} type="button" variant="secondary" onClick={() => onUpdate({ confirmed: true })}>
          <CheckCircle2 size={16} />
          Confirmar gol
        </Button>
        <Button type="button" variant="ghost" onClick={onRemove} title="Remover gol">
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}
