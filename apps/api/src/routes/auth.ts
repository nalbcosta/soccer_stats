import type { FastifyPluginAsync } from "fastify";
import { googleAuthInputSchema, publicUserSchema, signInInputSchema, signUpInputSchema } from "@soccer-stats/shared";
import { authRouteSchemas } from "../docs/openapi.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/signup", { schema: authRouteSchemas.signUp }, async (request, reply) => {
    const payload = signUpInputSchema.parse(request.body);

    try {
      const user = await app.auth.registerWithCredentials(payload.email, payload.username, payload.password, payload.locale);
      await app.auth.createSession(reply, user.id);
      return { user: publicUserSchema.parse(user) };
    } catch (error) {
      reply.code(400);
      return { message: error instanceof Error ? error.message : "Falha ao criar conta." };
    }
  });

  app.post("/auth/signin", { schema: authRouteSchemas.signIn }, async (request, reply) => {
    const payload = signInInputSchema.parse(request.body);
    const user = await app.auth.signInWithCredentials(payload.email, payload.password);

    if (!user) {
      reply.code(401);
      return { message: "Credenciais invalidas." };
    }

    await app.auth.createSession(reply, user.id);
    return { user: publicUserSchema.parse(user) };
  });

  app.post("/auth/google", { schema: authRouteSchemas.google }, async (request, reply) => {
    const payload = googleAuthInputSchema.parse(request.body);

    try {
      const user = await app.auth.signInWithGoogleCredential(payload.credential, payload.locale);
      await app.auth.createSession(reply, user.id);
      return { user: publicUserSchema.parse(user) };
    } catch (error) {
      reply.code(400);
      return { message: error instanceof Error ? error.message : "Falha no login Google." };
    }
  });

  app.post("/auth/signout", { schema: authRouteSchemas.signOut }, async (request, reply) => {
    await app.auth.clearSession(reply, request);
    return { ok: true };
  });

  app.get("/auth/me", { schema: authRouteSchemas.me }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    return { user: publicUserSchema.parse(user) };
  });
};
