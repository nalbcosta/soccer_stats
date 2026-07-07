import type { FastifyPluginAsync } from "fastify";
import { notificationRouteSchemas } from "../../docs/openapi.js";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "./notification.controller.js";

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/notifications", { schema: notificationRouteSchemas.list }, listNotifications);
  app.patch("/notifications/:notificationId/read", { schema: notificationRouteSchemas.markRead }, markNotificationRead);
  app.post("/notifications/read-all", { schema: notificationRouteSchemas.markAllRead }, markAllNotificationsRead);
};
