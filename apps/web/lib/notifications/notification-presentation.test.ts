import { describe, expect, it } from "vitest";
import type { Notification } from "@soccer-stats/shared";
import { getNotificationPresentation } from "./notification-presentation";

const messages: Record<string, string> = {
  notificationMatchCompletedTitle: "Match completed",
  notificationMatchCompletedMessage: "{homeTeam} {homeScore} vs {awayScore} {awayTeam}.",
  notificationMatchCompletedFallbackMessage: "A match was completed."
};

const translate = (key: string, values?: Record<string, string | number>) => {
  const message = messages[key] ?? key;
  return values ? Object.entries(values).reduce((result, [name, value]) => result.replaceAll(`{${name}}`, String(value)), message) : message;
};

describe("getNotificationPresentation", () => {
  it("localiza notificacao persistida a partir do tipo e metadados", () => {
    const notification: Notification = {
      id: "notification-1",
      userId: "user-1",
      type: "match-completed",
      title: "Partida encerrada",
      message: "Time Azul 2 x 1 Time Verde.",
      metadata: {
        matchId: "match-1",
        homeTeam: "Time Azul",
        homeScore: "2",
        awayScore: "1",
        awayTeam: "Time Verde"
      },
      createdAt: "2026-07-14T12:00:00.000Z"
    };

    expect(getNotificationPresentation(notification, translate)).toMatchObject({
      href: "/app/matches/match-1",
      title: "Match completed",
      message: "Time Azul 2 vs 1 Time Verde."
    });
  });

  it("usa um fallback localizado para notificacoes antigas sem metadados", () => {
    const notification: Notification = {
      id: "notification-2",
      userId: "user-1",
      type: "match-completed",
      title: "Partida encerrada",
      message: "Time Azul 2 x 1 Time Verde.",
      createdAt: "2026-07-14T12:00:00.000Z"
    };

    expect(getNotificationPresentation(notification, translate).message).toBe("A match was completed.");
  });

  it("usa o slug do time no link quando disponivel", () => {
    const notification: Notification = {
      id: "notification-3",
      userId: "user-1",
      type: "team-member-added",
      title: "Entrada no time",
      message: "Voce entrou no time.",
      metadata: { teamId: "team-uuid", teamSlug: "resenha-fc-a1b2c3" },
      createdAt: "2026-07-14T12:00:00.000Z"
    };

    expect(getNotificationPresentation(notification, translate).href).toBe("/app/teams/resenha-fc-a1b2c3");
  });
});
