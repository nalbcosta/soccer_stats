"use client";

import Link from "next/link";
import type { MatchListItem } from "../../composables/use-matches-page";
import { EmptyState } from "../feedback/empty-state";
import { ScoreboardCard } from "../sports/scoreboard-card";

export function MatchList({
  emptyDescription,
  emptyTitle,
  items
}: {
  emptyDescription: string;
  emptyTitle: string;
  items: MatchListItem[];
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} actionHref="/app/matches" actionLabel="Marcar jogo" />;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Link href={item.href} key={item.match.id}>
          <ScoreboardCard
            awayName={item.awayName}
            awayScore={item.match.away.score}
            homeName={item.homeName}
            homeScore={item.match.home.score}
            match={item.match}
            meta={item.dateLabel}
            status={item.match.status}
            {...(item.tournament ? { tournament: item.tournament } : {})}
          />
        </Link>
      ))}
    </div>
  );
}
