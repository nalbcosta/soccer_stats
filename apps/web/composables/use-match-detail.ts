"use client";

import { useMemo, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import type { Match } from "@soccer-stats/shared";
import { api } from "../lib/api";
import { findMatch } from "../lib/entity-lookup";
import {
  buildParticipants,
  buildSheetSummary,
  formatVenueLabel,
  resolveTeamName,
  userCanCheckIn,
  type MatchDetailTab
} from "../lib/matches/match-view-model";
import { useSession } from "../components/app/session-provider";

export function useMatchDetail() {
  const params = useParams<{ matchId: string }>();
  const { dashboard, refresh, setFeedback, user } = useSession();
  const [tab, setTab] = useState<MatchDetailTab>("overview");
  const [isPending, startTransition] = useTransition();

  const result = findMatch(dashboard, params.matchId);
  const match = result.status === "found" ? result.entity : null;

  const model = useMemo(() => {
    if (!dashboard || !match) {
      return null;
    }

    const tournament = match.tournamentId ? dashboard.tournaments.find((item) => item.id === match.tournamentId) : undefined;

    const homeName = resolveTeamName(dashboard.teams, match.home.teamId, "Casa");
    const awayName = resolveTeamName(dashboard.teams, match.away.teamId, "Fora");
    const participants = buildParticipants(match, { homeName, awayName });

    return {
      match,
      homeName,
      awayName,
      tournament,
      participants,
      sheet: buildSheetSummary(match, participants),
      venueLabel: formatVenueLabel(match),
      canCheckIn: userCanCheckIn(match, user)
    };
  }, [dashboard, match, user]);

  const updatePresence = (status: "pending" | "confirmed" | "declined" | "maybe") => {
    if (!match) {
      return;
    }

    startTransition(() => {
      void api.updateMyMatchPresence(match.id, { status }).then(async () => {
        setFeedback("Presença atualizada.");
        await refresh();
      });
    });
  };

  const checkIn = () => {
    if (!match) {
      return;
    }

    startTransition(() => {
      void api.checkInMatch(match.id).then(async () => {
        setFeedback("Check-in confirmado.");
        await refresh();
      });
    });
  };

  return {
    checkIn,
    isPending,
    model,
    result,
    tab,
    setTab,
    updatePresence
  };
}

export type { Match, MatchDetailTab };
