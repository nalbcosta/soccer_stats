"use client";

import { useState, useTransition } from "react";
import type { Match } from "@soccer-stats/shared";
import { Check, Plus, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

export function CompleteMatchForm({ match }: { match: Match }) {
  const { refresh, setFeedback } = useSession();
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState({
    homeScore: match.home.score,
    awayScore: match.away.score
  });
  const [durationMinutes, setDurationMinutes] = useState(String(match.durationMinutes ?? 60));
  const [goals, setGoals] = useState<Array<{ minute: string; teamId: string; playerId: string; assistPlayerId: string }>>(
    match.eventLog
      .filter((event) => event.type === "goal")
      .map((event) => ({
        minute: String(event.minute),
        teamId: event.teamId,
        playerId: event.playerId,
        assistPlayerId: event.assistPlayerId ?? ""
      }))
  );

  if (match.status === "completed") {
    return <p className="rounded-lg bg-field-soft p-3 text-sm font-bold text-field">Placar fechado.</p>;
  }

  const playerOptions = [
    ...match.home.playerIds.map((playerId, index) => ({ playerId, teamId: match.home.teamId, label: `Casa ${index + 1}` })),
    ...match.away.playerIds.map((playerId, index) => ({ playerId, teamId: match.away.teamId, label: `Fora ${index + 1}` }))
  ];

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          const eventLog = goals
            .filter((goal) => goal.minute && goal.teamId && goal.playerId)
            .map((goal) => ({
              minute: Number(goal.minute),
              type: "goal" as const,
              teamId: goal.teamId,
              playerId: goal.playerId,
              ...(goal.assistPlayerId ? { assistPlayerId: goal.assistPlayerId } : {})
            }));

          void api.completeMatch({ id: match.id, ...score, durationMinutes: Number(durationMinutes), eventLog }).then(async () => {
            setFeedback("Placar fechado.");
            await refresh();
          });
        });
      }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Input
          min={0}
          type="number"
          value={score.homeScore}
          onChange={(event) => setScore((state) => ({ ...state, homeScore: Number(event.target.value) }))}
        />
        <span className="font-black">x</span>
        <Input
          min={0}
          type="number"
          value={score.awayScore}
          onChange={(event) => setScore((state) => ({ ...state, awayScore: Number(event.target.value) }))}
        />
      </div>
      <Input
        max={180}
        min={1}
        placeholder="Duracao final (min)"
        type="number"
        value={durationMinutes}
        onChange={(event) => setDurationMinutes(event.target.value)}
      />
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Gols da partida</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setGoals((state) => [...state, { minute: "", teamId: match.home.teamId, playerId: match.home.playerIds[0] ?? "", assistPlayerId: "" }])
            }
          >
            <Plus size={16} />
            Gol
          </Button>
        </div>
        {goals.map((goal, index) => {
          const availablePlayers = playerOptions.filter((player) => player.teamId === goal.teamId);

          return (
            <div className="grid gap-2 rounded-lg border border-border bg-canvas p-2" key={index}>
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <Input
                  max={130}
                  min={0}
                  placeholder="Min"
                  type="number"
                  value={goal.minute}
                  onChange={(event) =>
                    setGoals((state) => state.map((item, itemIndex) => (itemIndex === index ? { ...item, minute: event.target.value } : item)))
                  }
                />
                <Select
                  value={goal.teamId}
                  onChange={(event) =>
                    setGoals((state) =>
                      state.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, teamId: event.target.value, playerId: "", assistPlayerId: "" } : item
                      )
                    )
                  }
                >
                  <option value={match.home.teamId}>Casa</option>
                  <option value={match.away.teamId}>Fora</option>
                </Select>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Select
                  value={goal.playerId}
                  onChange={(event) =>
                    setGoals((state) => state.map((item, itemIndex) => (itemIndex === index ? { ...item, playerId: event.target.value } : item)))
                  }
                >
                  <option value="">Autor</option>
                  {availablePlayers.map((player) => (
                    <option key={player.playerId} value={player.playerId}>
                      {player.label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={goal.assistPlayerId}
                  onChange={(event) =>
                    setGoals((state) =>
                      state.map((item, itemIndex) => (itemIndex === index ? { ...item, assistPlayerId: event.target.value } : item))
                    )
                  }
                >
                  <option value="">Sem assistencia</option>
                  {availablePlayers
                    .filter((player) => player.playerId !== goal.playerId)
                    .map((player) => (
                      <option key={player.playerId} value={player.playerId}>
                        {player.label}
                      </option>
                    ))}
                </Select>
                <Button type="button" variant="ghost" onClick={() => setGoals((state) => state.filter((_, itemIndex) => itemIndex !== index))}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <Button disabled={isPending} type="submit">
        <Check size={18} />
        Fechar placar
      </Button>
    </form>
  );
}
