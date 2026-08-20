import type { FastifyPluginAsync } from "fastify";
import { createVenue, createVenueChangeRequest, getVenue, listVenueModeration, listVenues, moderateVenueChange, moderateVenueReview, submitVenueReview, updateVenue } from "./venue.controller.js";

export const venueRoutes: FastifyPluginAsync = async (app) => {
  app.get("/venues", { schema: { tags: ["venues"], summary: "Lista campos aprovados com filtros e paginacao" } }, listVenues);
  app.post("/venues", { schema: { tags: ["venues"], summary: "Envia um novo campo para moderacao" } }, createVenue);
  app.post("/venue-change-requests", { schema: { tags: ["venues"], summary: "Envia correcao, fechamento ou reabertura" } }, createVenueChangeRequest);
  app.get("/admin/venues/moderation", { schema: { tags: ["admin"], summary: "Lista filas pendentes de campos e avaliacoes" } }, listVenueModeration);
  app.patch("/admin/venues/change-requests/:requestId", { schema: { tags: ["admin"], summary: "Modera uma alteracao de campo" } }, moderateVenueChange);
  app.patch("/admin/venues/reviews/:reviewId", { schema: { tags: ["admin"], summary: "Modera uma avaliacao de campo" } }, moderateVenueReview);
  app.post("/venues/:venueId/reviews", { schema: { tags: ["venues"], summary: "Cria ou atualiza a avaliacao do usuario" } }, submitVenueReview);
  app.get("/venues/:venueId", { schema: { tags: ["venues"], summary: "Detalha campo por id ou slug" } }, getVenue);
  app.patch("/venues/:venueId", { schema: { tags: ["venues"], summary: "Envia uma correcao para moderacao" } }, updateVenue);
};
