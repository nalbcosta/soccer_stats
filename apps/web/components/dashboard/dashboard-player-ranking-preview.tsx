import Link from "next/link";
import type { PlayerRankingEntry } from "@soccer-stats/shared";
import { EmptyState } from "../feedback/empty-state";
import { Card } from "../ui/card";

export function DashboardPlayerRankingPreview({ players }: { players: PlayerRankingEntry[] }) {
  if (players.length === 0) {
    return (
      <EmptyState
        actionHref="/app/matches"
        actionLabel="Concluir partida"
        description="O ranking de jogadores aparece depois das primeiras súmulas fechadas."
        title="Ranking em aquecimento"
      />
    );
  }

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-field">Ranking de jogadores</p>
          <h2 className="mt-1 text-xl font-black">Destaques da turma</h2>
        </div>
        <Link className="text-sm font-black text-primary-strong" href="/app/ranking">
          Ver ranking
        </Link>
      </div>

      <Card className="overflow-hidden">
        {players.map((player) => (
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0" key={player.playerId}>
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary-soft text-sm font-black text-primary-strong tabular-nums">
              {player.rank}
            </span>
            <div className="min-w-0">
              <p className="truncate font-black">{player.displayName}</p>
              <p className="truncate text-xs font-semibold text-muted">{player.explanation}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black tabular-nums">{player.ratings.overall}</p>
              <p className="text-[11px] font-black uppercase text-muted">OVR</p>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}
