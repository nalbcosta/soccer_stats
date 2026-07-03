"use client";

import { useState, useTransition } from "react";
import { CalendarPlus } from "lucide-react";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

export function MatchCreateForm() {
  const { dashboard, user, refresh, setFeedback } = useSession();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    homeTeamId: "",
    awayTeamId: "",
    tournamentId: "",
    playedAt: new Date().toISOString().slice(0, 16)
  });

  const teams = dashboard?.teams ?? [];
  const tournaments = dashboard?.tournaments ?? [];

  return (
    <form
      className="grid gap-2 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!user) {
          return;
        }

        startTransition(() => {
          const payload = {
            type: form.tournamentId ? ("tournament" as const) : ("casual" as const),
              home: { teamId: form.homeTeamId, score: 0, playerIds: [user.id] },
              away: { teamId: form.awayTeamId, score: 0, playerIds: [user.id] },
              playedAt: new Date(form.playedAt).toISOString()
          };

          void api
            .createMatch(form.tournamentId ? { ...payload, tournamentId: form.tournamentId } : payload)
            .then(async () => {
              setFeedback("Jogo marcado.");
              await refresh();
            });
        });
      }}
    >
      <Select value={form.homeTeamId} onChange={(event) => setForm((state) => ({ ...state, homeTeamId: event.target.value }))}>
        <option value="">Time da casa</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </Select>
      <Select value={form.awayTeamId} onChange={(event) => setForm((state) => ({ ...state, awayTeamId: event.target.value }))}>
        <option value="">Time visitante</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </Select>
      <Select value={form.tournamentId} onChange={(event) => setForm((state) => ({ ...state, tournamentId: event.target.value }))}>
        <option value="">Pelada avulsa</option>
        {tournaments.map((tournament) => (
          <option key={tournament.id} value={tournament.id}>
            {tournament.name}
          </option>
        ))}
      </Select>
      <Input type="datetime-local" value={form.playedAt} onChange={(event) => setForm((state) => ({ ...state, playedAt: event.target.value }))} />
      <Button className="md:col-span-2" disabled={isPending || !form.homeTeamId || !form.awayTeamId} type="submit">
        <CalendarPlus size={18} />
        Marcar jogo
      </Button>
    </form>
  );
}
