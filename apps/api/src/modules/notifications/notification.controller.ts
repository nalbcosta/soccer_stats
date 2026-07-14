import type { FastifyReply, FastifyRequest } from "fastify";
import { notificationSchema } from "@soccer-stats/shared";
import { NotificationService } from "./notification.service.js";

export const listNotifications = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);

  if (!user) {
    return;
  }

  const notifications = await new NotificationService(request.server.repositories).listByUser(user.id);
  return { notifications: notifications.map((notification) => notificationSchema.parse(notification)) };
};

export const markNotificationRead = async (
  request: FastifyRequest<{ Params: { notificationId: string } }>,
  reply: FastifyReply
) => {
  const user = await request.server.auth.requireUser(request, reply);

  if (!user) {
    return;
  }

  const notification = await request.server.repositories.notifications.markRead(
    request.params.notificationId,
    user.id,
    new Date().toISOString()
  );

  if (!notification) {
    reply.code(404);
    return { message: "Notificacao nao encontrada." };
  }

  return { notification: notificationSchema.parse(notification) };
};

export const markAllNotificationsRead = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);

  if (!user) {
    return;
  }

  await request.server.repositories.notifications.markAllRead(user.id, new Date().toISOString());
  return { ok: true };
};
