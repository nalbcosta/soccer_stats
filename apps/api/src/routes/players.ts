import type { FastifyPluginAsync } from "fastify";
import { playerProfileSchema, updateProfileInputSchema } from "@soccer-stats/shared";
import { playerRouteSchemas } from "../docs/openapi.js";

export const playerRoutes: FastifyPluginAsync = async (app) => {
  app.get("/players/me", { schema: playerRouteSchemas.getMe }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const profile = await app.repositories.playerProfiles.findByUserId(user.id);
    return { profile: profile ? playerProfileSchema.parse(profile) : null };
  });

  app.put("/players/me", { schema: playerRouteSchemas.updateMe }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const payload = updateProfileInputSchema.parse(request.body);
    const existing = await app.repositories.playerProfiles.findByUserId(user.id);

    if (!existing) {
      reply.code(404);
      return { message: "Perfil nao encontrado." };
    }

    const nextProfile = {
      ...existing,
      displayName: payload.displayName,
      preferredFoot: payload.preferredFoot,
      preferredPosition: payload.preferredPosition,
      ...(payload.bio ? { bio: payload.bio } : {})
    };
    const profile = await app.repositories.playerProfiles.upsert(nextProfile);

    return { profile: playerProfileSchema.parse(profile) };
  });
};
