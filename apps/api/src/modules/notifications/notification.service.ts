import type { Notification, NotificationType } from "@soccer-stats/shared";
import type { Repositories } from "../../types.js";
import { createId } from "../../lib/ids.js";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, string>;
}

export class NotificationService {
  constructor(private readonly repositories: Repositories) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification: Notification = {
      id: createId(),
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      ...(input.metadata ? { metadata: input.metadata } : {}),
      createdAt: new Date().toISOString()
    };

    return this.repositories.notifications.create(notification);
  }

  async notifyUsers(userIds: string[], input: Omit<CreateNotificationInput, "userId">): Promise<void> {
    const uniqueUserIds = [...new Set(userIds)];
    await Promise.all(uniqueUserIds.map((userId) => this.create({ ...input, userId })));
  }
}
