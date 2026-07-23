import type { Notification, NotificationType } from "@soccer-stats/shared";
import type { LucideIcon } from "lucide-react";
import { Bell, CalendarDays, CheckCircle2, MailPlus, Trophy, UserRound } from "lucide-react";

type Translate = (key: string, values?: Record<string, string | number>) => string;

export interface NotificationPresentation {
  href: string;
  icon: LucideIcon;
  message: string;
  title: string;
}

type NotificationRule = {
  href: (metadata: Record<string, string>) => string;
  icon: LucideIcon;
  message: (notification: Notification, translate: Translate) => string;
  titleKey: string;
};

const metadataOf = (notification: Notification) => notification.metadata ?? {};

const translatedMessage = (
  notification: Notification,
  translate: Translate,
  key: string,
  fallbackKey: string,
  requiredMetadata: string[]
) => {
  const metadata = metadataOf(notification);
  const hasRequiredMetadata = requiredMetadata.every((field) => metadata[field]);

  return hasRequiredMetadata ? translate(key, metadata) : translate(fallbackKey);
};

const notificationRules: Record<NotificationType, NotificationRule> = {
  "invite-created": {
    href: () => "/app/invites",
    icon: MailPlus,
    titleKey: "notificationInviteCreatedTitle",
    message: (notification, translate) => translatedMessage(notification, translate, "notificationInviteCreatedMessage", "notificationInviteCreatedFallbackMessage", ["teamName"])
  },
  "invite-accepted": {
    href: (metadata) => metadata.teamId ? `/app/teams/${metadata.teamId}` : "/app/teams",
    icon: UserRound,
    titleKey: "notificationInviteAcceptedTitle",
    message: (notification, translate) => translatedMessage(notification, translate, "notificationInviteAcceptedMessage", "notificationInviteAcceptedFallbackMessage", ["username", "teamName"])
  },
  "match-scheduled": {
    href: (metadata) => metadata.matchId ? `/app/matches/${metadata.matchId}` : "/app/matches",
    icon: CalendarDays,
    titleKey: "notificationMatchScheduledTitle",
    message: (notification, translate) => translatedMessage(notification, translate, "notificationMatchScheduledMessage", "notificationMatchScheduledFallbackMessage", ["homeTeam", "awayTeam"])
  },
  "match-completed": {
    href: (metadata) => metadata.matchId ? `/app/matches/${metadata.matchId}` : "/app/matches",
    icon: CheckCircle2,
    titleKey: "notificationMatchCompletedTitle",
    message: (notification, translate) => translatedMessage(notification, translate, "notificationMatchCompletedMessage", "notificationMatchCompletedFallbackMessage", ["homeTeam", "homeScore", "awayScore", "awayTeam"])
  },
  "match-cancelled": {
    href: (metadata) => metadata.matchId ? `/app/matches/${metadata.matchId}` : "/app/matches",
    icon: CalendarDays,
    titleKey: "notificationMatchCancelledTitle",
    message: (notification, translate) => translate("notificationMatchCancelledMessage")
  },
  "presence-updated": {
    href: (metadata) => metadata.matchId ? `/app/matches/${metadata.matchId}` : "/app/matches",
    icon: UserRound,
    titleKey: "notificationPresenceUpdatedTitle",
    message: (notification, translate) => translate("notificationPresenceUpdatedMessage")
  },
  "team-member-added": {
    href: (metadata) => metadata.teamId ? `/app/teams/${metadata.teamId}` : "/app/teams",
    icon: UserRound,
    titleKey: "notificationTeamMemberAddedTitle",
    message: (notification, translate) => translatedMessage(notification, translate, "notificationTeamMemberAddedMessage", "notificationTeamMemberAddedFallbackMessage", ["teamName"])
  },
  "tournament-updated": {
    href: (metadata) => metadata.tournamentId ? `/app/tournaments/${metadata.tournamentId}` : "/app/tournaments",
    icon: Trophy,
    titleKey: "notificationTournamentUpdatedTitle",
    message: (notification, translate) => translatedMessage(notification, translate, "notificationTournamentUpdatedMessage", "notificationTournamentUpdatedFallbackMessage", ["tournamentName"])
  }
};

export function getNotificationPresentation(notification: Notification, translate: Translate): NotificationPresentation {
  const rule = notificationRules[notification.type];
  const metadata = metadataOf(notification);

  return {
    href: rule.href(metadata),
    icon: rule.icon ?? Bell,
    title: translate(rule.titleKey),
    message: rule.message(notification, translate)
  };
}
