import { CalendarDays, MapPin, Trophy } from "lucide-react";
import type { Match } from "@soccer-stats/shared";
import { ScoreboardCard } from "../sports/scoreboard-card";
import { Card } from "../ui/card";

export function MatchOverviewPanel({
  awayName,
  homeName,
  match,
  tournament,
  venueLabel
}: {
  awayName: string;
  homeName: string;
  match: Match;
  tournament?: { name: string };
  venueLabel: string;
}) {
  return (
    <div className="grid gap-4">
      <ScoreboardCard
        awayName={awayName}
        awayScore={match.away.score}
        homeName={homeName}
        homeScore={match.home.score}
        match={match}
        status={match.status}
      />
      <Card className="p-4">
        <p className="text-xs font-black uppercase text-muted">Detalhes do jogo</p>
        <div className="mt-3 grid gap-2">
          <InfoRow icon={CalendarDays} label="Data" value={new Date(match.playedAt).toLocaleString("pt-BR")} />
          <InfoRow icon={MapPin} label="Local" value={venueLabel} />
          <InfoRow icon={Trophy} label="Competição" value={tournament?.name ?? "Pelada avulsa"} />
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-canvas p-3">
      <Icon className="text-primary-strong" size={17} />
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase text-muted">{label}</p>
        <p className="truncate text-sm font-black">{value}</p>
      </div>
    </div>
  );
}
