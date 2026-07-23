"use client";

import { CalendarPlus, Clock3, LocateFixed, MapPin, Trophy, Users } from "lucide-react";
import { useMatchCreate } from "../../composables/use-match-create";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

export function MatchCreateForm({ onCreated }: { onCreated?: () => void }) {
  const {
    canSubmit,
    form,
    isPending,
    locationError,
    locationLoading,
    submit,
    summary,
    teams,
    tournaments,
    update,
    useCurrentLocation
  } = useMatchCreate(onCreated);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <section className="rounded-lg bg-canvas p-4">
        <p className="text-xs font-black uppercase text-muted">Prévia</p>
        <p className="mt-2 text-xl font-black">{summary.title}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-muted">
          <InfoPill icon={Clock3} label={summary.date} />
          <InfoPill icon={MapPin} label={summary.venue} />
        </div>
      </section>

      <Section icon={Users} title="Quem joga?">
        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={form.homeTeamId} onChange={(event) => update("homeTeamId", event.target.value)}>
            <option value="">Time da casa</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
          <Select value={form.awayTeamId} onChange={(event) => update("awayTeamId", event.target.value)}>
            <option value="">Time visitante</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
        </div>
      </Section>

      <Section icon={CalendarPlus} title="Quando vai rolar?">
        <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
          <Input type="datetime-local" value={form.playedAt} onChange={(event) => update("playedAt", event.target.value)} />
          <Input
            max={180}
            min={1}
            placeholder="Min"
            type="number"
            value={form.durationMinutes}
            onChange={(event) => update("durationMinutes", event.target.value)}
          />
        </div>
      </Section>

      <Section icon={MapPin} title="Onde?">
        <div className="grid gap-2">
          <Button className="w-full" disabled={locationLoading} type="button" variant="secondary" onClick={useCurrentLocation}>
            <LocateFixed size={17} />
            {locationLoading ? "Localizando..." : "Usar minha localização"}
          </Button>
          {locationError ? <p className="text-sm font-semibold text-error">{locationError}</p> : null}
          <Input placeholder="Nome do campo, quadra ou arena" value={form.venueName} onChange={(event) => update("venueName", event.target.value)} />
          <div className="grid gap-2 sm:grid-cols-[1fr_10rem]">
            <Input placeholder="Endereço ou bairro" value={form.venueAddress} onChange={(event) => update("venueAddress", event.target.value)} />
            <Select value={form.venueSurface} onChange={(event) => update("venueSurface", event.target.value)}>
              <option value="">Piso</option>
              <option value="grass">Grama</option>
              <option value="synthetic">Sintético</option>
              <option value="court">Quadra</option>
              <option value="sand">Areia</option>
              <option value="other">Outro</option>
            </Select>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_6rem]">
            <Input placeholder="Cidade" value={form.venueCity} onChange={(event) => update("venueCity", event.target.value)} />
            <Input
              maxLength={2}
              placeholder="UF"
              value={form.venueState}
              onChange={(event) => update("venueState", event.target.value.toUpperCase())}
            />
          </div>
        </div>
      </Section>

      <Section icon={Trophy} title="Vale campeonato?">
        <Select value={form.tournamentId} onChange={(event) => update("tournamentId", event.target.value)}>
          <option value="">Pelada avulsa</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </Select>
      </Section>

      <Button disabled={isPending || !canSubmit} type="submit">
        <CalendarPlus size={18} />
        Marcar jogo
      </Button>
    </form>
  );
}

function Section({ children, icon: Icon, title }: { children: React.ReactNode; icon: typeof Users; title: string }) {
  return (
    <section className="grid gap-3 rounded-lg border border-border bg-surface p-3 shadow-line">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary-soft text-primary-strong">
          <Icon size={16} />
        </span>
        <p className="font-black">{title}</p>
      </div>
      {children}
    </section>
  );
}

function InfoPill({ icon: Icon, label }: { icon: typeof Clock3; label: string }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-surface px-2.5">
      <Icon size={14} />
      {label}
    </span>
  );
}
