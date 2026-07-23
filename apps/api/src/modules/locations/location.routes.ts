import type { FastifyPluginAsync } from "fastify";
import { locationReverseQuerySchema, locationSearchQuerySchema } from "@soccer-stats/shared";
import { locationRouteSchemas } from "../../docs/openapi.js";
import { LocationService } from "./location.service.js";

export const locationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/locations/reverse", { schema: locationRouteSchemas.reverse }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const query = locationReverseQuerySchema.parse(request.query);
    const location = await new LocationService(app.config).reverse(query.latitude, query.longitude);

    if (!location) {
      reply.code(404);
      return { message: "Localizacao nao encontrada." };
    }

    return { location };
  });

  app.get("/locations/search", { schema: locationRouteSchemas.search }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const query = locationSearchQuerySchema.parse(request.query);
    const locations = await new LocationService(app.config).search(query.q, query.limit);
    return { locations };
  });
};
