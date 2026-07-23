import type { Notification, NotificationType } from "@soccer-stats/shared";
import type { Repositories } from "../../types.js";
import { createId } from "../../lib/ids.js";
import { getNotificationFallback } from "./notification.rules.js";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title?: string;
  message?: string;
  metadata?: Record<string, string>;
}

export class NotificationService {
  constructor(private readonly repositories: Repositories) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    const fallback = getNotificationFallback(input.type);
    const notification: Notification = {
      id: createId(),
      userId: input.userId,
      type: input.type,
      title: input.title ?? fallback.title,
      message: input.message ?? fallback.message,
      ...(input.metadata ? { metadata: input.metadata } : {}),
      createdAt: new Date().toISOString()
    };

    return this.repositories.notifications.create(notification);
  }

  async notifyUsers(userIds: string[], input: Omit<CreateNotificationInput, "userId">): Promise<void> {
    const uniqueUserIds = [...new Set(userIds)];
    await Promise.all(uniqueUserIds.map((userId) => this.create({ ...input, userId })));
  }

  async listByUser(userId: string): Promise<Notification[]> {
    const notifications = await this.repositories.notifications.listByUser(userId);
    return Promise.all(notifications.map((notification) => this.enrichLegacyMetadata(notification)));
  }

  private async enrichLegacyMetadata(notification: Notification): Promise<Notification> {
    const metadata = notification.metadata ?? {};

    if (notification.type.startsWith("match-") || notification.type === "presence-updated") {
      return this.enrichMatchMetadata(notification, metadata);
    }

    if (notification.type === "invite-created" || notification.type === "invite-accepted" || notification.type === "team-member-added") {
      return this.enrichTeamMetadata(notification, metadata);
    }

    if (notification.type === "tournament-updated") {
      const tournament = metadata.tournamentId ? await this.repositories.tournaments.findById(metadata.tournamentId) : null;
      return tournament && !metadata.tournamentName
        ? { ...notification, metadata: { ...metadata, tournamentName: tournament.name } }
        : notification;
    }

    return notification;
  }

  private async enrichMatchMetadata(notification: Notification, metadata: Record<string, string>): Promise<Notification> {
    const match = metadata.matchId ? await this.repositories.matches.findById(metadata.matchId) : null;

    if (!match) {
      return notification;
    }

    const teams = await this.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);
    const teamNames = new Map(teams.map((team) => [team.id, team.name]));
    const enrichedMetadata = {
      ...metadata,
      ...(metadata.homeTeam ? {} : { homeTeam: teamNames.get(match.home.teamId) ?? "" }),
      ...(metadata.awayTeam ? {} : { awayTeam: teamNames.get(match.away.teamId) ?? "" }),
      ...(metadata.homeScore ? {} : { homeScore: String(match.home.score) }),
      ...(metadata.awayScore ? {} : { awayScore: String(match.away.score) })
    };

    return { ...notification, metadata: enrichedMetadata };
  }

  private async enrichTeamMetadata(notification: Notification, metadata: Record<string, string>): Promise<Notification> {
    const team = metadata.teamId ? await this.repositories.teams.findById(metadata.teamId) : null;

    return team && !metadata.teamName
      ? { ...notification, metadata: { ...metadata, teamName: team.name } }
      : notification;
  }
}
