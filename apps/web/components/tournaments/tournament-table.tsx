import type { Tournament, Team } from "@soccer-stats/shared";

export function TournamentTable({ tournament, teams }: { tournament: Tournament; teams: Team[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-canvas text-xs uppercase text-muted">
          <tr>
            <th className="px-3 py-3">Time</th>
            <th className="px-3 py-3 text-right">Pts</th>
            <th className="px-3 py-3 text-right">J</th>
            <th className="px-3 py-3 text-right">SG</th>
          </tr>
        </thead>
        <tbody>
          {tournament.standings.map((standing) => {
            const team = teams.find((item) => item.id === standing.teamId);

            return (
              <tr className="border-t border-border" key={standing.teamId}>
                <td className="px-3 py-3 font-bold">{team?.name ?? standing.teamId}</td>
                <td className="px-3 py-3 text-right font-black">{standing.stats.points}</td>
                <td className="px-3 py-3 text-right">{standing.stats.matchesPlayed}</td>
                <td className="px-3 py-3 text-right">{standing.stats.goalDifference}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
