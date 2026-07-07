"use client";

import { useState, useTransition } from "react";
import type { Match } from "@soccer-stats/shared";
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
    durationMinutes: "60",
    venueName: "",
    venueAddress: "",
    venueSurface: "",
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
              playedAt: new Date(form.playedAt).toISOString(),
              ...(form.durationMinutes ? { durationMinutes: Number(form.durationMinutes) } : {}),
              ...(form.venueName || form.venueAddress || form.venueSurface
                ? {
                    venue: {
                      ...(form.venueName ? { name: form.venueName } : {}),
                      ...(form.venueAddress ? { address: form.venueAddress } : {}),
                      ...(form.venueSurface ? { surface: form.venueSurface as NonNullable<NonNullable<Match["venue"]>["surface"]> } : {})
                    }
                  }
                : {})
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
      <Input
        min={1}
        max={180}
        placeholder="Duracao prevista (min)"
        type="number"
        value={form.durationMinutes}
        onChange={(event) => setForm((state) => ({ ...state, durationMinutes: event.target.value }))}
      />
      <Input placeholder="Estadio ou local" value={form.venueName} onChange={(event) => setForm((state) => ({ ...state, venueName: event.target.value }))} />
      <Input placeholder="Endereco / bairro" value={form.venueAddress} onChange={(event) => setForm((state) => ({ ...state, venueAddress: event.target.value }))} />
      <Select value={form.venueSurface} onChange={(event) => setForm((state) => ({ ...state, venueSurface: event.target.value }))}>
        <option value="">Terreno</option>
        <option value="grass">Grama</option>
        <option value="synthetic">Sintetico</option>
        <option value="court">Quadra</option>
        <option value="sand">Areia</option>
        <option value="other">Outro</option>
      </Select>
      <Button className="md:col-span-2" disabled={isPending || !form.homeTeamId || !form.awayTeamId} type="submit">
        <CalendarPlus size={18} />
        Marcar jogo
      </Button>
    </form>
  );
}
