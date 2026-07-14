"use client";

import { useMatchDetail } from "../../composables/use-match-detail";
import { PageHeading } from "../app/page-heading";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import { MatchDetailTabs } from "./match-detail-tabs";
import { MatchOverviewPanel } from "./match-overview-panel";
import { MatchPresencePanel } from "./match-presence-panel";
import { MatchSheetPanel } from "./match-sheet-panel";
import { MatchCommentsPanel } from "./match-comments-panel";
import { useSession } from "../app/session-provider";

export function MatchDetail() {
  const { checkIn, isPending, model, result, setTab, tab, updatePresence } = useMatchDetail();
  const { user } = useSession();

  if (result.status === "loading") {
    return <LoadingState />;
  }

  if (result.status === "not-found" || !model) {
    return <NotFoundPanel title="Jogo não encontrado" backHref="/app/matches" />;
  }

  return (
    <>
      <PageHeading eyebrow="Jogo" title={`${model.homeName} x ${model.awayName}`} />
      <div className="grid gap-4">
        <MatchDetailTabs activeTab={tab} onChange={setTab} />
        {tab === "overview" ? (
          <MatchOverviewPanel
            awayName={model.awayName}
            homeName={model.homeName}
            match={model.match}
            venueLabel={model.venueLabel}
            {...(model.tournament ? { tournament: model.tournament } : {})}
          />
        ) : null}
        {tab === "presence" ? (
          <MatchPresencePanel
            canCheckIn={model.canCheckIn}
            isPending={isPending}
            onCheckIn={checkIn}
            onPresence={updatePresence}
            participants={model.participants}
          />
        ) : null}
        {tab === "sheet" ? <MatchSheetPanel awayName={model.awayName} homeName={model.homeName} match={model.match} sheet={model.sheet} /> : null}
        {user ? <MatchCommentsPanel canModerate={model.match.createdBy === user.id} matchId={model.match.id} userId={user.id} /> : null}
      </div>
    </>
  );
}
