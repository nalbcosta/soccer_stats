import type { FastifyPluginAsync } from "fastify";
import { auditLogSchema } from "@soccer-stats/shared";
import { auditRouteSchemas } from "../../docs/openapi.js";

export const auditRoutes: FastifyPluginAsync = async (app) => {
  app.get("/audit-logs/me", { schema: auditRouteSchemas.listMine }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const auditLogs = await app.repositories.auditLogs.listByActor(user.id);
    return { auditLogs: auditLogs.map((auditLog) => auditLogSchema.parse(auditLog)) };
  });
};
