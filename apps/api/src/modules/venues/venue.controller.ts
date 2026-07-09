import type { FastifyReply, FastifyRequest } from "fastify";
import { createVenueInputSchema, listVenuesQuerySchema, updateVenueInputSchema, venueSchema } from "@soccer-stats/shared";
import { VenueService } from "./venue.service.js";
import { AuditService } from "../audit/audit.service.js";

export const createVenue = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);

  if (!user) {
    return;
  }

  const payload = createVenueInputSchema.parse(request.body);
  const service = new VenueService(request.server.repositories);
  const venue = await service.create(user, {
    name: payload.name,
    visibility: payload.visibility,
    ...(payload.address ? { address: payload.address } : {}),
    city: payload.city,
    state: payload.state,
    surface: payload.surface,
    ...(payload.latitude !== undefined ? { latitude: payload.latitude } : {}),
    ...(payload.longitude !== undefined ? { longitude: payload.longitude } : {})
  });
  await new AuditService(request.server.repositories).record({
    actorUserId: user.id,
    action: "venue.create",
    resourceType: "venue",
    resourceId: venue.id
  });

  return { venue: venueSchema.parse(venue) };
};

export const listVenues = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);

  if (!user) {
    return;
  }

  const filters = listVenuesQuerySchema.parse(request.query);
  const venues = await request.server.repositories.venues.listVisibleToUser(user.id, {
    ...(filters.city ? { city: filters.city } : {}),
    ...(filters.state ? { state: filters.state } : {}),
    ...(filters.visibility ? { visibility: filters.visibility } : {}),
    page: filters.page,
    pageSize: filters.pageSize
  });

  return { venues: venues.map((venue) => venueSchema.parse(venue)) };
};

export const getVenue = async (request: FastifyRequest<{ Params: { venueId: string } }>, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);

  if (!user) {
    return;
  }

  const venue = await request.server.repositories.venues.findById(request.params.venueId);
  const service = new VenueService(request.server.repositories);

  if (!venue || !service.canView(user, venue)) {
    reply.code(404);
    return { message: "Local nao encontrado." };
  }

  return { venue: venueSchema.parse(venue) };
};

export const updateVenue = async (request: FastifyRequest<{ Params: { venueId: string } }>, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);

  if (!user) {
    return;
  }

  const payload = updateVenueInputSchema.parse(request.body);
  const service = new VenueService(request.server.repositories);
  const result = await service.update(user, request.params.venueId, {
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.visibility ? { visibility: payload.visibility } : {}),
    ...(payload.address ? { address: payload.address } : {}),
    ...(payload.city ? { city: payload.city } : {}),
    ...(payload.state ? { state: payload.state } : {}),
    ...(payload.surface ? { surface: payload.surface } : {}),
    ...(payload.latitude !== undefined ? { latitude: payload.latitude } : {}),
    ...(payload.longitude !== undefined ? { longitude: payload.longitude } : {})
  });

  if (result === "not-found") {
    reply.code(404);
    return { message: "Local nao encontrado." };
  }

  if (result === "forbidden") {
    reply.code(403);
    return { message: "Sem permissao para editar este local." };
  }

  await new AuditService(request.server.repositories).record({
    actorUserId: user.id,
    action: "venue.update",
    resourceType: "venue",
    resourceId: result.id
  });

  return { venue: venueSchema.parse(result) };
};
