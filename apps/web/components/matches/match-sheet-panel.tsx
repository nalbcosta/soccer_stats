import { AlertTriangle, ClipboardList, Goal } from "lucide-react";
import type { Match } from "@soccer-stats/shared";
import type { MatchSheetSummary } from "../../lib/matches/match-view-model";
import { Card } from "../ui/card";
import { CompleteMatchForm } from "./complete-match-form";

export function MatchSheetPanel({
  awayName,
  homeName,
  match,
  sheet
}: {
  awayName: string;
  homeName: string;
  match: Match;
  sheet: MatchSheetSummary;
}) {
  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-strong">
            <ClipboardList size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-black">Súmula da partida</p>
            <p className="mt-1 text-sm font-semibold text-muted">
              Gols e assistências daqui alimentam stats, ranking e NaBola Card.
            </p>
          </div>
        </div>

        {!sheet.scoreMatchesSheet && match.status === "completed" ? (
          <div className="mt-3 flex gap-2 rounded-lg bg-warning-soft p-3 text-sm font-semibold text-text">
            <AlertTriangle className="shrink-0" size={17} />
            O placar não bate com os gols registrados.
          </div>
        ) : null}
      </Card>

      <Card className="overflow-hidden">
        {sheet.goals.length === 0 ? (
          <div className="p-4 text-sm font-semibold text-muted">Nenhum gol registrado ainda.</div>
        ) : (
          sheet.goals.map((goal, index) => (
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0" key={`${goal.event.minute}-${goal.event.playerId}-${index}`}>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-field-soft text-field">
                <Goal size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-black">Gol aos {goal.event.minute}' • {goal.teamName}</p>
                <p className="truncate text-sm font-semibold text-muted">
                  {goal.playerLabel}
                  {goal.assistLabel ? ` • assistência ${goal.assistLabel}` : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </Card>

      <Card className="p-4">
        <p className="mb-3 font-black">Fechamento</p>
        <CompleteMatchForm awayName={awayName} homeName={homeName} match={match} />
      </Card>
    </div>
  );
}
