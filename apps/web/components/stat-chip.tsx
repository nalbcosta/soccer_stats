import type { AggregatedStats } from "@soccer-stats/shared";
import { Card } from "./ui/card";

export function StatChip({
  label,
  value,
  accent
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-extrabold" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </Card>
  );
}

export function StatsStrip({ stats }: { stats: AggregatedStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <StatChip label="Jogos" value={stats.matchesPlayed} />
      <StatChip label="Vitorias" value={stats.wins} accent="var(--color-primary)" />
      <StatChip label="Gols" value={stats.goals} />
      <StatChip label="Aproveitamento" value={`${stats.winRate}%`} />
      <StatChip label="Momento" value={stats.recentHighlight} />
    </div>
  );
}
