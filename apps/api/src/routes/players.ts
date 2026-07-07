import type { FastifyPluginAsync } from "fastify";
import { writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import { playerProfileSchema, updateProfileInputSchema } from "@soccer-stats/shared";
import { playerRouteSchemas } from "../docs/openapi.js";
import { createId } from "../lib/ids.js";

function resolvePhotoExtension(filename: string, mimeType: string) {
  const normalizedExtension = extname(filename).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".webp"].includes(normalizedExtension)) {
    return normalizedExtension === ".jpeg" ? ".jpg" : normalizedExtension;
  }

  if (mimeType === "image/png") {
    return ".png";
  }

  if (mimeType === "image/webp") {
    return ".webp";
  }

  return ".jpg";
}

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
      ...(payload.shirtNumber ? { shirtNumber: payload.shirtNumber } : {}),
      ...(payload.teamName ? { teamName: payload.teamName } : {}),
      preferredFoot: payload.preferredFoot,
      preferredPosition: payload.preferredPosition,
      ...(payload.bio ? { bio: payload.bio } : {}),
      ...(payload.photoUrl ? { photoUrl: payload.photoUrl } : {})
    };
    const profile = await app.repositories.playerProfiles.upsert(nextProfile);

    return { profile: playerProfileSchema.parse(profile) };
  });

  app.post("/players/me/photo", { schema: playerRouteSchemas.uploadPhoto }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const existing = await app.repositories.playerProfiles.findByUserId(user.id);

    if (!existing) {
      reply.code(404);
      return { message: "Perfil nao encontrado." };
    }

    const part = await request.file();

    if (!part) {
      reply.code(400);
      return { message: "Arquivo de foto nao enviado." };
    }

    if (!part.mimetype.startsWith("image/")) {
      reply.code(400);
      return { message: "Envie uma imagem valida." };
    }

    const extension = resolvePhotoExtension(part.filename, part.mimetype);
    const fileName = `${user.id}-${createId()}${extension}`;
    const filePath = fileURLToPath(new URL(`../../uploads/${fileName}`, import.meta.url));
    const buffer = await part.toBuffer();

    await writeFile(filePath, buffer);

    const profile = await app.repositories.playerProfiles.upsert({
      ...existing,
      photoUrl: `/uploads/${fileName}`
    });

    return { profile: playerProfileSchema.parse(profile) };
  });
};
