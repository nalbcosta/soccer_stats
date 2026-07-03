import type { MatchStatus } from "@soccer-stats/shared";
import { Card } from "../ui/card";
import { TeamCrest } from "../ui/team-crest";
import { MatchStatusChip } from "./match-status-chip";

export function ScoreboardCard({
  homeName,
  awayName,
  homeScore,
  awayScore,
  status,
  meta,
  eyebrow = "Jogo"
}: {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  meta?: string;
  eyebrow?: string;
}) {
  const isCompleted = status === "completed";

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="field-grid flex items-center justify-between border-b border-border bg-canvas/55 px-4 py-3">
        <div className="min-w-0">
          <p className="text-caption font-black uppercase text-muted">{eyebrow}</p>
          {meta ? <p className="mt-0.5 truncate text-xs font-semibold text-muted">{meta}</p> : null}
        </div>
        <MatchStatusChip status={status} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5 text-center">
        <TeamSide align="right" name={homeName} />
        <div className="min-w-[92px] rounded-md bg-canvas px-3 py-2 shadow-line">
          <p className="text-score font-black leading-none tabular-nums">
            {isCompleted ? `${homeScore} x ${awayScore}` : "vs"}
          </p>
          {!isCompleted ? <p className="mt-1 text-[11px] font-black uppercase text-primary-strong">Vai rolar</p> : null}
        </div>
        <TeamSide name={awayName} />
      </div>
    </Card>
  );
}

function TeamSide({ name, align = "left" }: { name: string; align?: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${align === "right" ? "justify-end" : "justify-start"}`}>
      {align === "left" ? <TeamCrest name={name} /> : null}
      <p className="truncate text-sm font-black">{name}</p>
      {align === "right" ? <TeamCrest name={name} /> : null}
    </div>
  );
}
