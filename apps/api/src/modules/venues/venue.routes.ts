import type { FastifyPluginAsync } from "fastify";
import { venueRouteSchemas } from "../../docs/openapi.js";
import { createVenue, getVenue, listVenues, updateVenue } from "./venue.controller.js";

export const venueRoutes: FastifyPluginAsync = async (app) => {
  app.get("/venues", { schema: venueRouteSchemas.list }, listVenues);
  app.post("/venues", { schema: venueRouteSchemas.create }, createVenue);
  app.get("/venues/:venueId", { schema: venueRouteSchemas.get }, getVenue);
  app.patch("/venues/:venueId", { schema: venueRouteSchemas.update }, updateVenue);
};
