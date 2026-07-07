import type { FastifyPluginAsync } from "fastify";
import { googleAuthInputSchema, publicUserSchema, signInInputSchema, signUpInputSchema, usernameAvailabilityQuerySchema } from "@soccer-stats/shared";
import { authRouteSchemas } from "../docs/openapi.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.get("/auth/username-availability", { schema: authRouteSchemas.usernameAvailability, config: { rateLimit: { max: 30, timeWindow: "1 minute" } } }, async (request, reply) => {
    const parsed = usernameAvailabilityQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      reply.code(400);
      return { available: false, message: "Use 3 a 20 caracteres: letras minusculas, numeros e _." };
    }

    const username = parsed.data.username.trim().toLowerCase();
    const existing = await app.repositories.users.findByUsername(username);

    return {
      available: !existing,
      message: existing ? "Apelido ja esta em uso." : "Apelido disponivel."
    };
  });

  app.post("/auth/signup", { schema: authRouteSchemas.signUp, config: { rateLimit: { max: 8, timeWindow: "1 minute" } } }, async (request, reply) => {
    const parsed = signUpInputSchema.safeParse(request.body);

    if (!parsed.success) {
      reply.code(400);
      return { message: "Revise email, apelido e senha para criar a conta." };
    }

    const payload = parsed.data;
    const email = payload.email.trim().toLowerCase();
    const username = payload.username.trim().toLowerCase();

    try {
      const user = await app.auth.registerWithCredentials(email, username, payload.password, payload.locale);
      await app.auth.createSession(reply, user.id);
      return { user: publicUserSchema.parse(user) };
    } catch (error) {
      reply.code(400);
      return { message: error instanceof Error ? error.message : "Falha ao criar conta." };
    }
  });

  app.post("/auth/signin", { schema: authRouteSchemas.signIn, config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
    const payload = signInInputSchema.parse(request.body);
    const email = payload.email.trim().toLowerCase();
    const user = await app.auth.signInWithCredentials(email, payload.password);

    if (!user) {
      reply.code(401);
      return { message: "Credenciais invalidas." };
    }

    await app.auth.createSession(reply, user.id, payload.rememberMe);
    return { user: publicUserSchema.parse(user) };
  });

  app.post("/auth/google", { schema: authRouteSchemas.google, config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
    const payload = googleAuthInputSchema.parse(request.body);

    try {
      const user = await app.auth.signInWithGoogleCredential(payload.credential, payload.locale);
      await app.auth.createSession(reply, user.id, payload.rememberMe);
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
