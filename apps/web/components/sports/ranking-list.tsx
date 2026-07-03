import type { Team } from "@soccer-stats/shared";
import { TeamCrest } from "../ui/team-crest";

export function RankingList({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort((left, right) => right.stats.points - left.stats.points);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {sorted.slice(0, 5).map((team, index) => (
        <div className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0" key={team.id}>
          <span className="w-5 text-center text-sm font-black text-muted">{index + 1}</span>
          <TeamCrest name={team.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">{team.name}</p>
            <p className="text-xs font-semibold text-muted">{team.stats.goals} gols</p>
          </div>
          <span className="rounded-sm bg-primary-soft px-2 py-1 text-sm font-black text-primary-strong">
            {team.stats.points} pts
          </span>
        </div>
      ))}
    </div>
  );
}
