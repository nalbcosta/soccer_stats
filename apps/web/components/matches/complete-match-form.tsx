"use client";

import { useState, useTransition } from "react";
import type { Match } from "@soccer-stats/shared";
import { Check } from "lucide-react";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function CompleteMatchForm({ match }: { match: Match }) {
  const { refresh, setFeedback } = useSession();
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState({
    homeScore: match.home.score,
    awayScore: match.away.score
  });

  if (match.status === "completed") {
    return <p className="rounded-lg bg-field-soft p-3 text-sm font-bold text-field">Placar fechado.</p>;
  }

  return (
    <form
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          void api.completeMatch({ id: match.id, ...score, eventLog: [] }).then(async () => {
            setFeedback("Placar fechado.");
            await refresh();
          });
        });
      }}
    >
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
      <Button className="col-span-3" disabled={isPending} type="submit">
        <Check size={18} />
        Fechar placar
      </Button>
    </form>
  );
}
