import type { NotificationType } from "@soccer-stats/shared";

type NotificationFallback = {
  title: string;
  message: string;
};

const fallbackByType: Record<NotificationType, NotificationFallback> = {
  "invite-created": { title: "New team invite", message: "You have a new team invitation." },
  "invite-accepted": { title: "Invite accepted", message: "A player accepted a team invitation." },
  "match-scheduled": { title: "Match scheduled", message: "A new match was scheduled." },
  "match-completed": { title: "Match completed", message: "A match was completed." },
  "match-cancelled": { title: "Match cancelled", message: "A match was cancelled." },
  "presence-updated": { title: "Presence updated", message: "A match presence was updated." },
  "team-member-added": { title: "Team joined", message: "You joined a team." },
  "tournament-updated": { title: "Standings updated", message: "Tournament standings were updated." }
};

export function getNotificationFallback(type: NotificationType): NotificationFallback {
  return fallbackByType[type];
}
