import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { AppConfig, Repositories } from "./types.js";
import { registerOpenApi } from "./docs/openapi.js";
import { authPlugin } from "./plugins/auth.js";
import { authRoutes } from "./routes/auth.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { matchRoutes } from "./routes/matches.js";
import { playerRoutes } from "./routes/players.js";
import { teamRoutes } from "./routes/teams.js";
import { tournamentRoutes } from "./routes/tournaments.js";

declare module "fastify" {
  interface FastifyInstance {
    repositories: Repositories;
  }
}

export const createApp = async (config: AppConfig, repositories: Repositories) => {
  const app = Fastify({
    logger: {
      level: config.nodeEnv === "production" ? "info" : "debug"
    }
  });

  app.decorate("repositories", repositories);
  await registerOpenApi(app);

  await app.register(cookie, { secret: config.sessionSecret });
  await app.register(cors, {
    origin: config.webOrigin,
    credentials: true
  });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });
  await app.register(authPlugin, { repositories, config });

  app.get("/health", async () => ({ ok: true }));

  await app.register(
    async (v1) => {
      await v1.register(authRoutes);
      await v1.register(playerRoutes);
      await v1.register(teamRoutes);
      await v1.register(matchRoutes);
      await v1.register(tournamentRoutes);
      await v1.register(dashboardRoutes);
    },
    { prefix: "/v1" }
  );

  return app;
};
