import type { FastifyPluginAsync } from "fastify";
import { googleAuthInputSchema, publicUserSchema, signInInputSchema, signUpInputSchema } from "@soccer-stats/shared";
import { authRouteSchemas } from "../docs/openapi.js";
import { AuditService } from "../modules/audit/audit.service.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/signup", { schema: authRouteSchemas.signUp, config: { rateLimit: { max: 8, timeWindow: "1 minute" } } }, async (request, reply) => {
    const parsed = signUpInputSchema.safeParse(request.body);

    if (!parsed.success) {
      reply.code(400);
      return { message: "Revise email, apelido e senha para criar a conta." };
    }

    const payload = parsed.data;
    const email = payload.email.trim().toLowerCase();
    const username = payload.username.trim();

    try {
      const user = await app.auth.registerWithCredentials(email, username, payload.password, payload.locale);
      await app.auth.createSession(reply, request, user.id);
      await new AuditService(app.repositories).record({
        actorUserId: user.id,
        action: "auth.signup",
        resourceType: "user",
        resourceId: user.id
      });
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

    await app.auth.createSession(reply, request, user.id, payload.rememberMe);
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "auth.signin",
      resourceType: "user",
      resourceId: user.id
    });
    return { user: publicUserSchema.parse(user) };
  });

  app.post("/auth/google", { schema: authRouteSchemas.google, config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (request, reply) => {
    const payload = googleAuthInputSchema.parse(request.body);

    try {
      const user = await app.auth.signInWithGoogleCredential(payload.credential, payload.locale);
      await app.auth.createSession(reply, request, user.id, payload.rememberMe);
      await new AuditService(app.repositories).record({
        actorUserId: user.id,
        action: "auth.google",
        resourceType: "user",
        resourceId: user.id
      });
      return { user: publicUserSchema.parse(user) };
    } catch (error) {
      reply.code(400);
      return { message: error instanceof Error ? error.message : "Falha no login Google." };
    }
  });

  app.post("/auth/signout", { schema: authRouteSchemas.signOut }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    await app.auth.clearSession(reply, request);
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "auth.signout",
      resourceType: "user",
      resourceId: user.id
    });
    return { ok: true };
  });

  app.get("/auth/csrf", { schema: authRouteSchemas.csrf }, async (_request, reply) => ({
    csrfToken: app.auth.createCsrfToken(reply)
  }));

  app.get("/auth/sessions", { schema: authRouteSchemas.sessions }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const currentSessionId = app.auth.getSessionId(request);
    const sessions = await app.repositories.sessions.listByUser(user.id);

    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastSeenAt: session.lastSeenAt,
        revokedAt: session.revokedAt,
        current: session.id === currentSessionId
      }))
    };
  });

  app.delete("/auth/sessions/:sessionId", { schema: authRouteSchemas.revokeSession }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const { sessionId } = request.params as { sessionId: string };
    const revoked = await app.repositories.sessions.revokeById(sessionId, user.id, new Date().toISOString());

    if (!revoked) {
      reply.code(404);
      return { message: "Sessao nao encontrada." };
    }

    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "auth.session-revoked",
      resourceType: "session",
      resourceId: sessionId
    });

    return { ok: true };
  });

  app.post("/auth/signout-all", { schema: authRouteSchemas.signOutAll }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    await app.repositories.sessions.revokeAllByUser(user.id, new Date().toISOString(), app.auth.getSessionId(request));
    await new AuditService(app.repositories).record({
      actorUserId: user.id,
      action: "auth.signout-all",
      resourceType: "user",
      resourceId: user.id
    });

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
