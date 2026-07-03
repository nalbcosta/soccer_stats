"use client";

import { Trophy } from "lucide-react";
import { useSession } from "../app/session-provider";
import { EmptyState } from "../feedback/empty-state";
import { LoadingListState } from "../feedback/loading-state";
import { SportsListItem } from "../sports/sports-list-item";

export function TournamentList() {
  const { dashboard } = useSession();

  if (!dashboard) {
    return <LoadingListState label="Buscando copas..." />;
  }

  if (dashboard.tournaments.length === 0) {
    return <EmptyState title="Sem copa criada" description="Junte pelo menos dois times e abra a primeira disputa." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {dashboard.tournaments.map((tournament) => (
        <SportsListItem
          description={`${tournament.teamIds.length} times na disputa`}
          href={`/app/tournaments/${tournament.id}`}
          icon={Trophy}
          key={tournament.id}
          meta={<p className="text-sm font-semibold text-muted">{tournament.matchIds.length} jogos registrados</p>}
          title={tournament.name}
          tone="marker"
        />
      ))}
    </div>
  );
}
