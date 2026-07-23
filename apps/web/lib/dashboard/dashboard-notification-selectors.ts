import type { Invite, Match, Notification } from "@soccer-stats/shared";
import { userNeedsCheckIn, userNeedsPresence } from "./dashboard-match-selectors";

export interface DashboardActionItem {
  key: string;
  tone: "primary" | "warning" | "neutral";
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}

export function selectUnreadNotifications(notifications: Notification[], limit = 4): Notification[] {
  return [...notifications]
    .filter((notification) => !notification.readAt)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}

export function buildDashboardActions({
  invites,
  matches,
  notifications,
  userId
}: {
  invites: Invite[];
  matches: Match[];
  notifications: Notification[];
  userId: string;
}): DashboardActionItem[] {
  const items: DashboardActionItem[] = [];
  const nextMatch = [...matches]
    .filter((match) => match.status === "scheduled" || match.status === "confirming")
    .sort((left, right) => new Date(left.playedAt).getTime() - new Date(right.playedAt).getTime())[0];

  if (nextMatch && userNeedsCheckIn(nextMatch, userId)) {
    items.push({
      key: `check-in-${nextMatch.id}`,
      tone: "primary",
      title: "Check-in do jogo",
      description: "Confirme que você chegou para a partida.",
      href: `/app/matches/${nextMatch.id}`,
      actionLabel: "Abrir jogo"
    });
  }

  if (nextMatch && userNeedsPresence(nextMatch, userId)) {
    items.push({
      key: `presence-${nextMatch.id}`,
      tone: "primary",
      title: "Confirme sua presença",
      description: "A turma precisa saber se você vai jogar.",
      href: `/app/matches/${nextMatch.id}`,
      actionLabel: "Responder"
    });
  }

  const pendingInvite = invites.find((invite) => invite.status === "pending");

  if (pendingInvite) {
    items.push({
      key: `invite-${pendingInvite.id}`,
      tone: "warning",
      title: "Convite pendente",
      description: "Tem convite esperando sua resposta.",
      href: "/app/invites",
      actionLabel: "Ver convite"
    });
  }

  const unreadNotification = selectUnreadNotifications(notifications, 1)[0];

  if (unreadNotification) {
    items.push({
      key: `notification-${unreadNotification.id}`,
      tone: "neutral",
      title: unreadNotification.title,
      description: unreadNotification.message,
      href: "/app/notifications",
      actionLabel: "Abrir avisos"
    });
  }

  if (items.length === 0) {
    items.push({
      key: "create-match",
      tone: "neutral",
      title: "Agenda pronta para o próximo jogo",
      description: "Quando tiver partida, presença ou convite, aparece aqui.",
      href: "/app/matches",
      actionLabel: "Marcar jogo"
    });
  }

  return items.slice(0, 4);
}
