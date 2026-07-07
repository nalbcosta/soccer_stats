import type { Match, MatchStatus, Tournament } from "@soccer-stats/shared";
import { CalendarClock, Clock3, MapPin, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";
import { TeamCrest } from "../ui/team-crest";
import { MatchStatusChip } from "./match-status-chip";

export function ScoreboardCard({
  match,
  homeName,
  awayName,
  homeScore,
  awayScore,
  status,
  meta,
  eyebrow = "Jogo",
  tournament,
  playerNames = {}
}: {
  match?: Match;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  meta?: string;
  eyebrow?: string;
  tournament?: Tournament;
  playerNames?: Record<string, string>;
}) {
  const isCompleted = status === "completed";
  const goals = match?.eventLog.filter((event) => event.type === "goal").sort((a, b) => a.minute - b.minute) ?? [];
  const homeGoals = goals.filter((goal) => goal.teamId === match?.home.teamId);
  const awayGoals = goals.filter((goal) => goal.teamId === match?.away.teamId);
  const venueText = formatVenue(match?.venue);
  const durationText = match?.durationMinutes ? `${match.durationMinutes} min` : null;
  const matchDate = match ? formatMatchDate(match.playedAt) : meta;

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="field-grid flex flex-col items-center gap-2 border-b border-border bg-canvas/55 px-4 py-3 text-center sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3 sm:text-left">
        <div className="min-w-0 sm:text-left">
          <p className="text-caption font-black uppercase text-muted">{eyebrow}</p>
        </div>
        {matchDate ? (
          <p className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-black text-text shadow-line sm:justify-self-center">
            {matchDate}
          </p>
        ) : null}
        <div className="sm:justify-self-end">
          <MatchStatusChip status={status} />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 px-3 pb-2 pt-5 text-center sm:gap-4 sm:px-4 sm:pb-3">
        <TeamSide align="right" name={homeName} />
        <div className="min-w-[92px] pt-1 sm:min-w-[112px]">
          <p className="text-3xl font-black leading-none tabular-nums text-text sm:text-4xl md:text-5xl">
            {isCompleted ? `${homeScore} - ${awayScore}` : "vs"}
          </p>
          <p className="mt-1 text-sm font-black text-muted sm:text-xs sm:uppercase">{isCompleted ? "Finalizado" : "Vai rolar"}</p>
        </div>
        <TeamSide name={awayName} />
      </div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-3 pb-4 sm:grid-cols-[1fr_auto_1fr] sm:px-4">
          <GoalList align="right" goals={homeGoals} playerNames={playerNames} />
          <div className="mx-auto hidden mt-0.5 sm:grid h-7 w-7 place-items-center rounded-full bg-canvas text-muted">
            <Target size={14} />
          </div>
          <GoalList goals={awayGoals} playerNames={playerNames} />
        </div>
      ) : null}

      <div className="grid gap-3 border-t border-border px-3 py-3 sm:px-4">
        <div className="flex flex-wrap gap-2">
          {durationText ? <InfoChip icon={Clock3} label={durationText} /> : null}
          {venueText ? <InfoChip icon={MapPin} label={venueText} /> : null}
          {tournament ? <InfoChip icon={Trophy} label={tournament.name} tone="primary" /> : null}
          {!durationText && !venueText && !tournament ? <InfoChip icon={CalendarClock} label="Detalhes pendentes" /> : null}
        </div>
      </div>
    </Card>
  );
}

function GoalList({
  goals,
  playerNames,
  align = "left"
}: {
  goals: Match["eventLog"];
  playerNames: Record<string, string>;
  align?: "left" | "right";
}) {
  if (goals.length === 0) {
    return <div className="hidden sm:block" />;
  }

  return (
    <div
      className={`grid gap-1 rounded-lg bg-canvas/55 p-2.5 text-xs font-bold text-muted sm:bg-transparent sm:p-0 ${
        align === "right" ? "justify-items-start text-left sm:justify-items-end sm:text-right" : "justify-items-start text-left"
      }`}
    >
      {goals.map((goal, index) => (
        <p className="leading-tight" key={`${goal.teamId}-${goal.playerId}-${goal.minute}-${index}`}>
          <span className="font-black text-text">{playerNames[goal.playerId] ?? "Jogador"}</span>{" "}
          <span>{goal.minute}'</span>
          {goal.assistPlayerId ? <span className="block text-[11px]">ass. {playerNames[goal.assistPlayerId] ?? "assistente"}</span> : null}
        </p>
      ))}
    </div>
  );
}

function formatVenue(venue: Match["venue"]) {
  if (!venue?.name && !venue?.address && !venue?.surface) {
    return null;
  }

  const surfaceLabel = venue.surface ? surfaceLabels[venue.surface] : null;
  return [venue.name, surfaceLabel, venue.address].filter(Boolean).join(" • ");
}

type VenueSurface = NonNullable<NonNullable<Match["venue"]>["surface"]>;

const surfaceLabels: Record<VenueSurface, string> = {
  grass: "grama",
  synthetic: "sintético",
  court: "quadra",
  sand: "areia",
  other: "outro"
};

function formatMatchDate(playedAt: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric"
  })
    .format(new Date(playedAt))
    .replace(",", " •");
}

function InfoChip({
  icon: Icon,
  label,
  tone = "muted"
}: {
  icon: LucideIcon;
  label: string;
  tone?: "muted" | "primary";
}) {
  return (
    <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-black ${tone === "primary" ? "bg-primary-soft text-primary-strong" : "bg-canvas text-muted"}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}

function TeamSide({ name, align = "left" }: { name: string; align?: "left" | "right" }) {
  return (
    <div
      className={`grid min-w-0 justify-items-center gap-2 ${
        align === "right" ? "sm:justify-items-end" : "sm:justify-items-start"
      }`}
    >
      <TeamCrest name={name} />
      <p className="max-w-full text-balance text-sm font-black leading-tight sm:text-sm">{name}</p>
    </div>
  );
}
