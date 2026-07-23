"use client";

import { useMemo, useState, useTransition } from "react";
import type { Match } from "@soccer-stats/shared";
import { api } from "../lib/api";
import { useSession } from "../components/app/session-provider";

export interface GoalDraft {
  minute: string;
  teamId: string;
  playerId: string;
  assistPlayerId: string;
  confirmed: boolean;
}

export interface GoalPlayerOption {
  playerId: string;
  teamId: string;
  teamName: string;
  label: string;
}

export function useMatchSheetEditor(match: Match, teamNames: { homeName: string; awayName: string }) {
  const { refresh, setFeedback } = useSession();
  const [isPending, startTransition] = useTransition();
  const [durationMinutes, setDurationMinutes] = useState(String(match.durationMinutes ?? 60));
  const [goals, setGoals] = useState<GoalDraft[]>(
    match.eventLog
      .filter((event) => event.type === "goal")
      .map((event) => ({
        minute: String(event.minute),
        teamId: event.teamId,
        playerId: event.playerId,
        assistPlayerId: event.assistPlayerId ?? "",
        confirmed: true
      }))
  );

  const playerOptions: GoalPlayerOption[] = useMemo(
    () => [
      ...match.home.playerIds.map((playerId, index) => ({
        playerId,
        teamId: match.home.teamId,
        teamName: teamNames.homeName,
        label: `Jogador ${index + 1}`
      })),
      ...match.away.playerIds.map((playerId, index) => ({
        playerId,
        teamId: match.away.teamId,
        teamName: teamNames.awayName,
        label: `Jogador ${index + 1}`
      }))
    ],
    [match.away.playerIds, match.away.teamId, match.home.playerIds, match.home.teamId, teamNames.awayName, teamNames.homeName]
  );

  const derivedScore = useMemo(
    () => ({
      homeScore: goals.filter((goal) => goal.teamId === match.home.teamId && goal.minute && goal.playerId).length,
      awayScore: goals.filter((goal) => goal.teamId === match.away.teamId && goal.minute && goal.playerId).length
    }),
    [goals, match.away.teamId, match.home.teamId]
  );

  const addGoal = () => {
    setGoals((state) => [
      ...state,
      { minute: "", teamId: match.home.teamId, playerId: match.home.playerIds[0] ?? "", assistPlayerId: "", confirmed: false }
    ]);
  };

  const updateGoal = (index: number, nextGoal: Partial<GoalDraft>) => {
    setGoals((state) => state.map((goal, itemIndex) => (itemIndex === index ? { ...goal, ...nextGoal } : goal)));
  };

  const removeGoal = (index: number) => {
    setGoals((state) => state.filter((_, itemIndex) => itemIndex !== index));
  };

  const submit = () => {
    startTransition(() => {
      const eventLog = goals
        .filter((goal) => goal.minute && goal.teamId && goal.playerId)
        .map((goal) => ({
          minute: Number(goal.minute),
          type: "goal" as const,
          teamId: goal.teamId,
          playerId: goal.playerId,
          ...(goal.assistPlayerId ? { assistPlayerId: goal.assistPlayerId } : {})
        }));

      void api.completeMatch({ id: match.id, ...derivedScore, durationMinutes: Number(durationMinutes), eventLog }).then(async () => {
        setFeedback("Placar fechado.");
        await refresh();
      });
    });
  };

  return {
    addGoal,
    derivedScore,
    durationMinutes,
    goals,
    isPending,
    playerOptions,
    removeGoal,
    setDurationMinutes,
    submit,
    updateGoal
  };
}
