import type { FastifyPluginAsync } from "fastify";
import { unlink, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import { playerCardProjectionSchema, playerProfileSchema, updateProfileInputSchema } from "@soccer-stats/shared";
import { playerRouteSchemas } from "../docs/openapi.js";
import { createId } from "../lib/ids.js";
import { ProfileService } from "../modules/players/profile.service.js";
import { StatsService } from "../modules/stats/stats.service.js";

const allowedPhotoMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function removeStoredPhoto(photoUrl: string | undefined, nextPhotoUrl?: string) {
  if (!photoUrl || photoUrl === nextPhotoUrl || !photoUrl.startsWith("/uploads/")) return;

  const fileName = photoUrl.slice("/uploads/".length);
  if (!/^[a-zA-Z0-9-]+\.(jpg|png|webp)$/.test(fileName)) return;

  try {
    await unlink(fileURLToPath(new URL(`../../uploads/${fileName}`, import.meta.url)));
  } catch (error: unknown) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }
}

function resolvePhotoExtension(filename: string, mimeType: string): ".jpg" | ".png" | ".webp" | null {
  const normalizedExtension = extname(filename).toLowerCase();

  switch (normalizedExtension) {
    case ".jpg":
    case ".jpeg":
      return ".jpg";
    case ".png":
      return ".png";
    case ".webp":
      return ".webp";
    default:
      break;
  }

  if (mimeType === "image/png") {
    return ".png";
  }

  if (mimeType === "image/webp") {
    return ".webp";
  }

  return null;
}

function detectImageMimeType(buffer: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export const playerRoutes: FastifyPluginAsync = async (app) => {
  const profileService = new ProfileService(app.repositories);

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
    const result = await profileService.update(user.id, payload);

    if ("reason" in result) {
      if (result.reason === "not-found") {
        reply.code(404);
        return { message: "Perfil nao encontrado." };
      }

      reply.code(422);
      return { message: "O time principal precisa pertencer ao jogador." };
    }

    await removeStoredPhoto(result.previousPhotoUrl, result.profile.photoUrl);
    await new StatsService(app.repositories).refreshPlayerCardProjection(user.id);
    return { profile: playerProfileSchema.parse(result.profile) };
  });

  app.post("/players/me/photo", { schema: playerRouteSchemas.uploadPhoto }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const part = await request.file();

    if (!part) {
      reply.code(400);
      return { message: "Arquivo de foto nao enviado." };
    }

    const extension = resolvePhotoExtension(part.filename, part.mimetype);
    const buffer = await part.toBuffer();
    const detectedMimeType = detectImageMimeType(buffer);

    if (!extension || !allowedPhotoMimeTypes.has(part.mimetype) || !detectedMimeType || detectedMimeType !== part.mimetype) {
      reply.code(400);
      return { message: "Envie uma imagem JPG, PNG ou WebP valida." };
    }

    const fileName = `${user.id}-${createId()}${extension}`;
    const filePath = fileURLToPath(new URL(`../../uploads/${fileName}`, import.meta.url));
    await writeFile(filePath, buffer);

    const profile = await profileService.setPhoto(user.id, `/uploads/${fileName}`, {
      fileName,
      mimeType: detectedMimeType,
      size: buffer.length,
      uploadedAt: new Date().toISOString()
    });

    if (!profile) {
      reply.code(404);
      return { message: "Perfil nao encontrado." };
    }

    await removeStoredPhoto(profile.previousPhotoUrl, profile.profile.photoUrl);
    return { profile: playerProfileSchema.parse(profile.profile) };
  });

  app.get("/players/:userId/card", { schema: playerRouteSchemas.getCard }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { userId } = request.params as { userId: string };
    const profile = await app.repositories.playerProfiles.findByUserId(userId);
    if (!profile) {
      reply.code(404);
      return { message: "Jogador nao encontrado." };
    }

    if (userId !== user.id) {
      const visibleTeams = await app.repositories.teams.listVisibleToUser(user.id);
      const canReadCard = visibleTeams.some((team) => team.members.some((member) => member.userId === userId));
      if (!canReadCard) {
        reply.code(404);
        return { message: "Jogador nao encontrado." };
      }
    }

    const card = await new StatsService(app.repositories).getPlayerCardProjection(userId);

    if (!card) {
      reply.code(404);
      return { message: "Jogador nao encontrado." };
    }

    return { card: playerCardProjectionSchema.parse(card) };
  });

  app.get("/players/:userId/insights", { schema: playerRouteSchemas.getInsights }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { userId } = request.params as { userId: string };
    const profile = await app.repositories.playerProfiles.findByUserId(userId);
    if (!profile) {
      reply.code(404);
      return { message: "Jogador nao encontrado." };
    }

    const statsService = new StatsService(app.repositories);
    const card = await statsService.getPlayerCardProjection(userId);
    if (!card) {
      reply.code(404);
      return { message: "Jogador nao encontrado." };
    }
    return { insights: statsService.buildProjectionInsights(card) };
  });
};
