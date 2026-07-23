import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import mongoose from "mongoose";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ZodError } from "zod";
import type { AppConfig, Repositories } from "./types.js";
import { registerOpenApi } from "./docs/openapi.js";
import { authPlugin } from "./plugins/auth.js";
import { authRoutes } from "./routes/auth.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { matchRoutes } from "./routes/matches.js";
import { playerRoutes } from "./routes/players.js";
import { teamRoutes } from "./routes/teams.js";
import { tournamentRoutes } from "./routes/tournaments.js";
import { inviteRoutes } from "./routes/invites.js";
import { rankingRoutes } from "./routes/rankings.js";
import { notificationRoutes } from "./modules/notifications/notification.routes.js";
import { venueRoutes } from "./modules/venues/venue.routes.js";
import { validateCsrfToken } from "./modules/auth/csrf.js";
import { auditRoutes } from "./modules/audit/audit.routes.js";
import { locationRoutes } from "./modules/locations/location.routes.js";
import { socialRoutes } from "./routes/social.js";

declare module "fastify" {
  interface FastifyInstance {
    repositories: Repositories;
    config: AppConfig;
  }
}

export const createApp = async (config: AppConfig, repositories: Repositories) => {
  const uploadsRoot = fileURLToPath(new URL("../uploads/", import.meta.url));
  const app = Fastify({
    logger: {
      level: config.nodeEnv === "production" ? "info" : "debug"
    }
  });

  app.decorate("repositories", repositories);
  app.decorate("config", config);
  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({ code: "VALIDATION_ERROR", message: "Payload invalido.", details: error.issues });
      return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
      reply.code(400).send({ code: "MONGOOSE_VALIDATION_ERROR", message: "Documento invalido.", details: Object.keys(error.errors) });
      return;
    }

    throw error;
  });
  await registerOpenApi(app);
  await mkdir(uploadsRoot, { recursive: true });

  await app.register(cookie, { secret: config.sessionSecret });
  await app.register(cors, {
    origin: config.webOrigin,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"]
  });
  await app.register(helmet, {
    crossOriginResourcePolicy: { policy: "cross-origin" }
  });
  await app.register(multipart, {
    limits: {
      fileSize: 4 * 1024 * 1024,
      files: 1
    }
  });
  await app.register(fastifyStatic, {
    root: uploadsRoot,
    prefix: "/uploads/"
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });
  await app.register(authPlugin, { repositories, config });

  app.addHook("preHandler", async (request, reply) => {
    const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
    const csrfExemptPaths = new Set(["/v1/auth/signup", "/v1/auth/signin", "/v1/auth/google", "/v1/auth/csrf"]);

    if (!mutatingMethods.has(request.method) || csrfExemptPaths.has(request.url.split("?")[0] ?? request.url)) {
      return;
    }

    if (request.url.startsWith("/v1/") && !validateCsrfToken(request)) {
      return reply.code(403).send({ message: "Token CSRF invalido." });
    }
  });

  app.get("/health", async () => ({ ok: true }));

  await app.register(
    async (v1) => {
      await v1.register(authRoutes);
      await v1.register(playerRoutes);
      await v1.register(teamRoutes);
      await v1.register(inviteRoutes);
      await v1.register(venueRoutes);
      await v1.register(locationRoutes);
      await v1.register(matchRoutes);
      await v1.register(socialRoutes);
      await v1.register(tournamentRoutes);
      await v1.register(rankingRoutes);
      await v1.register(notificationRoutes);
      await v1.register(auditRoutes);
      await v1.register(dashboardRoutes);
    },
    { prefix: "/v1" }
  );

  return app;
};
