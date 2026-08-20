import type { FastifyReply, FastifyRequest } from "fastify";
import type { StoredUser } from "../../types.js";
import type { VenueChangeSet } from "@soccer-stats/shared";
import {
  createVenueChangeRequestInputSchema,
  createVenueInputSchema,
  listVenuesQuerySchema,
  moderationDecisionInputSchema,
  updateVenueInputSchema,
  venueChangeRequestSchema,
  venueReviewInputSchema,
  venueReviewSchema,
  venueSchema
} from "@soccer-stats/shared";
import { VenueService } from "./venue.service.js";
import { AuditService } from "../audit/audit.service.js";
import { createId } from "../../lib/ids.js";

const compact = <T extends object>(value: T) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>;

const requireAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<StoredUser | undefined> => {
  const user = await request.server.auth.requireUser(request, reply);
  if (user && user.platformRole !== "admin") {
    reply.code(403).send({ message: "Acesso exclusivo para administradores da plataforma." });
    return undefined;
  }
  return user;
};

const createPendingChange = async (request: FastifyRequest, user: StoredUser, input: { venueId?: string; kind: "create" | "update" | "close" | "reopen"; changes: VenueChangeSet }) => {
  const now = new Date().toISOString();
  const changeRequest = await request.server.repositories.venueChangeRequests.create({
    id: createId(), ...(input.venueId ? { venueId: input.venueId } : {}), kind: input.kind, changes: input.changes,
    status: "pending", submittedBy: user.id, createdAt: now, updatedAt: now
  });
  await new AuditService(request.server.repositories).record({ actorUserId: user.id, action: `venue.change.${input.kind}.submit`, resourceType: "venue-change-request", resourceId: changeRequest.id });
  return changeRequest;
};

export const createVenue = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);
  if (!user) return;
  const payload = createVenueInputSchema.parse(request.body);
  const changeRequest = await createPendingChange(request, user, { kind: "create", changes: compact(payload) as VenueChangeSet });
  reply.code(202);
  return { request: venueChangeRequestSchema.parse(changeRequest) };
};

export const createVenueChangeRequest = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);
  if (!user) return;
  const payload = createVenueChangeRequestInputSchema.parse(request.body);
  if (payload.venueId && !await request.server.repositories.venues.findById(payload.venueId)) {
    reply.code(404); return { message: "Campo nao encontrado." };
  }
  const changeRequest = await createPendingChange(request, user, { ...(payload.venueId ? { venueId: payload.venueId } : {}), kind: payload.kind, changes: compact(payload.changes) as VenueChangeSet });
  reply.code(202);
  return { request: venueChangeRequestSchema.parse(changeRequest) };
};

export const listVenues = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);
  if (!user) return;
  const filters = listVenuesQuerySchema.parse(request.query);
  const result = await request.server.repositories.venues.listVisibleToUser(user.id, {
    ...(filters.q ? { q: filters.q } : {}), ...(filters.city ? { city: filters.city } : {}),
    ...(filters.state ? { state: filters.state } : {}), ...(filters.visibility ? { visibility: filters.visibility } : {}),
    ...(filters.surface ? { surface: filters.surface } : {}), ...(filters.status ? { status: filters.status } : {}),
    page: filters.page, pageSize: filters.pageSize
  });
  return {
    venues: result.items.map((venue) => venueSchema.parse(venue)),
    pagination: { page: filters.page, pageSize: filters.pageSize, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / filters.pageSize)) }
  };
};

export const getVenue = async (request: FastifyRequest<{ Params: { venueId: string } }>, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);
  if (!user) return;
  const venue = await request.server.repositories.venues.findById(request.params.venueId) ?? await request.server.repositories.venues.findBySlug(request.params.venueId);
  const service = new VenueService(request.server.repositories);
  if (!venue || !service.canView(user, venue)) { reply.code(404); return { message: "Campo nao encontrado." }; }
  const [reviews, myReview] = await Promise.all([
    request.server.repositories.venueReviews.listByVenue(venue.id, "approved"),
    request.server.repositories.venueReviews.findByVenueAndAuthor(venue.id, user.id)
  ]);
  return { venue: venueSchema.parse(venue), reviews: reviews.map((review) => venueReviewSchema.parse(review)), ...(myReview ? { myReview: venueReviewSchema.parse(myReview) } : {}) };
};

export const updateVenue = async (request: FastifyRequest<{ Params: { venueId: string } }>, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply);
  if (!user) return;
  const venue = await request.server.repositories.venues.findById(request.params.venueId);
  if (!venue) { reply.code(404); return { message: "Campo nao encontrado." }; }
  const changes = updateVenueInputSchema.parse(request.body);
  const changeRequest = await createPendingChange(request, user, { venueId: venue.id, kind: "update", changes: compact(changes) as VenueChangeSet });
  reply.code(202);
  return { request: venueChangeRequestSchema.parse(changeRequest) };
};

export const listVenueModeration = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = await requireAdmin(request, reply); if (!user) return;
  const [requests, reviews] = await Promise.all([request.server.repositories.venueChangeRequests.list("pending"), request.server.repositories.venueReviews.list("pending")]);
  const venueIds = [...new Set([
    ...requests.flatMap((item) => item.venueId ? [item.venueId] : []),
    ...reviews.map((item) => item.venueId)
  ])];
  const venues = (await Promise.all(venueIds.map((id) => request.server.repositories.venues.findById(id)))).filter((venue) => venue !== null);
  return {
    requests: requests.map((item) => venueChangeRequestSchema.parse(item)),
    reviews: reviews.map((item) => venueReviewSchema.parse(item)),
    venues: venues.map((venue) => venueSchema.parse(venue))
  };
};

export const moderateVenueChange = async (request: FastifyRequest<{ Params: { requestId: string } }>, reply: FastifyReply) => {
  const user = await requireAdmin(request, reply); if (!user) return;
  const payload = moderationDecisionInputSchema.parse(request.body);
  const pending = await request.server.repositories.venueChangeRequests.findById(request.params.requestId);
  if (!pending) { reply.code(404); return { message: "Solicitacao nao encontrada." }; }
  if (pending.status !== "pending") { reply.code(409); return { message: "Solicitacao ja moderada." }; }
  const now = new Date().toISOString();
  if (payload.decision === "approve") {
    const service = new VenueService(request.server.repositories);
    if (pending.kind === "create") {
      const validated = createVenueInputSchema.parse(pending.changes);
      await service.create(await request.server.repositories.users.findById(pending.submittedBy) ?? user, validated, { approvedBy: user.id, approvedAt: now });
    } else {
      const venue = pending.venueId ? await request.server.repositories.venues.findById(pending.venueId) : null;
      if (!venue) { reply.code(404); return { message: "Campo relacionado nao encontrado." }; }
      if (pending.kind === "update") await request.server.repositories.venues.update({ ...venue, ...compact(pending.changes), ...(pending.changes.state ? { state: pending.changes.state.toUpperCase() } : {}), updatedAt: now } as typeof venue);
      if (pending.kind === "close") await request.server.repositories.venues.update({ ...venue, status: "closed", updatedAt: now });
      if (pending.kind === "reopen") await request.server.repositories.venues.update({ ...venue, status: "active", updatedAt: now });
    }
  }
  const reviewed = await request.server.repositories.venueChangeRequests.update({ ...pending, status: payload.decision === "approve" ? "approved" : "rejected", reviewedBy: user.id, reviewedAt: now, ...(payload.reason ? { reviewReason: payload.reason } : {}), updatedAt: now });
  await new AuditService(request.server.repositories).record({ actorUserId: user.id, action: `venue.change.${payload.decision}`, resourceType: "venue-change-request", resourceId: reviewed.id });
  return { request: venueChangeRequestSchema.parse(reviewed) };
};

export const submitVenueReview = async (request: FastifyRequest<{ Params: { venueId: string } }>, reply: FastifyReply) => {
  const user = await request.server.auth.requireUser(request, reply); if (!user) return;
  const venue = await request.server.repositories.venues.findById(request.params.venueId);
  if (!venue) { reply.code(404); return { message: "Campo nao encontrado." }; }
  const payload = venueReviewInputSchema.parse(request.body);
  const existing = await request.server.repositories.venueReviews.findByVenueAndAuthor(venue.id, user.id);
  const now = new Date().toISOString();
  const review = await request.server.repositories.venueReviews.upsert({
    id: existing?.id ?? createId(), venueId: venue.id, authorId: user.id, rating: payload.rating,
    ...(payload.comment ? { comment: payload.comment } : {}), status: "pending", createdAt: existing?.createdAt ?? now, updatedAt: now
  });
  reply.code(existing ? 200 : 201);
  return { review: venueReviewSchema.parse(review) };
};

export const moderateVenueReview = async (request: FastifyRequest<{ Params: { reviewId: string } }>, reply: FastifyReply) => {
  const user = await requireAdmin(request, reply); if (!user) return;
  const payload = moderationDecisionInputSchema.parse(request.body);
  const review = await request.server.repositories.venueReviews.findById(request.params.reviewId);
  if (!review) { reply.code(404); return { message: "Avaliacao nao encontrada." }; }
  if (review.status !== "pending") { reply.code(409); return { message: "Avaliacao ja moderada." }; }
  const now = new Date().toISOString();
  const updated = await request.server.repositories.venueReviews.update({ ...review, status: payload.decision === "approve" ? "approved" : "rejected", reviewedBy: user.id, reviewedAt: now, ...(payload.reason ? { reviewReason: payload.reason } : {}), updatedAt: now });
  const approved = await request.server.repositories.venueReviews.listByVenue(review.venueId, "approved");
  const venue = await request.server.repositories.venues.findById(review.venueId);
  if (venue) await request.server.repositories.venues.update({ ...venue, ratingCount: approved.length, ratingAverage: approved.length ? approved.reduce((total, item) => total + item.rating, 0) / approved.length : 0, updatedAt: now });
  await new AuditService(request.server.repositories).record({ actorUserId: user.id, action: `venue.review.${payload.decision}`, resourceType: "venue-review", resourceId: updated.id });
  return { review: venueReviewSchema.parse(updated) };
};
