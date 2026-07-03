import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { OAuth2Client } from "google-auth-library";
import { createEmptyStats } from "@soccer-stats/shared";
import type { AppConfig, AppContext, Repositories, SessionRecord, StoredUser } from "../types.js";
import { createId } from "../lib/ids.js";
import { hashPassword, verifyPassword } from "../lib/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    context?: AppContext;
  }

  interface FastifyInstance {
    auth: {
      requireUser: (request: FastifyRequest, reply: FastifyReply) => Promise<StoredUser | undefined>;
      signInWithCredentials: (email: string, password: string) => Promise<StoredUser | null>;
      signInWithGoogleCredential: (credential: string, locale: StoredUser["locale"]) => Promise<StoredUser>;
      registerWithCredentials: (email: string, username: string, password: string, locale: StoredUser["locale"]) => Promise<StoredUser>;
      createSession: (reply: FastifyReply, userId: string) => Promise<void>;
      clearSession: (reply: FastifyReply, request: FastifyRequest) => Promise<void>;
    };
  }
}

const SESSION_COOKIE = "soccer_stats_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const createCookieOptions = (config: AppConfig) => ({
  path: "/",
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: config.nodeEnv === "production",
  ...(config.cookieDomain ? { domain: config.cookieDomain } : {})
});

const findOrCreateProfile = async (repositories: Repositories, user: StoredUser): Promise<void> => {
  const existingProfile = await repositories.playerProfiles.findByUserId(user.id);

  if (!existingProfile) {
    await repositories.playerProfiles.upsert({
      userId: user.id,
      displayName: user.username,
      preferredFoot: "right",
      preferredPosition: "midfielder",
      stats: createEmptyStats()
    });
  }
};

export const authPlugin = fp<{ repositories: Repositories; config: AppConfig }>(
  async (app: FastifyInstance, options: { repositories: Repositories; config: AppConfig }) => {
  const googleClient = options.config.googleClientId ? new OAuth2Client(options.config.googleClientId) : null;

  app.decorate("auth", {
    requireUser: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = request.cookies[SESSION_COOKIE];

      if (!sessionId) {
        reply.code(401).send({ message: "Nao autenticado." });
        return undefined;
      }

      const session = await options.repositories.sessions.findById(sessionId);

      if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
        reply.code(401).send({ message: "Sessao invalida." });
        return undefined;
      }

      const user = await options.repositories.users.findById(session.userId);

      if (!user) {
        reply.code(401).send({ message: "Usuario nao encontrado." });
        return undefined;
      }

      request.context = { user };
      return user;
    },
    signInWithCredentials: async (email: string, password: string) => {
      const user = await options.repositories.users.findByEmail(email);

      if (!user?.passwordHash) {
        return null;
      }

      return verifyPassword(password, user.passwordHash) ? user : null;
    },
    signInWithGoogleCredential: async (credential: string, locale: StoredUser["locale"]) => {
      if (!googleClient || !options.config.googleClientId) {
        throw new Error("Google auth nao configurado.");
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: options.config.googleClientId
      });

      const payload = ticket.getPayload();

      if (!payload?.email) {
        throw new Error("Token Google invalido.");
      }

      const existingByEmail = await options.repositories.users.findByEmail(payload.email);

      if (existingByEmail) {
        const updated = existingByEmail.providers.includes("google")
          ? existingByEmail
          : await options.repositories.users.update({
              ...existingByEmail,
              providers: [...existingByEmail.providers, "google"],
              updatedAt: new Date().toISOString()
            });

        await findOrCreateProfile(options.repositories, updated);
        return updated;
      }

      const baseUsername = (payload.email.split("@")[0] ?? "player").replace(/[^a-z0-9_]/gi, "").toLowerCase() || "player";
      let candidate = baseUsername;
      let suffix = 1;

      while (await options.repositories.users.findByUsername(candidate)) {
        suffix += 1;
        candidate = `${baseUsername}${suffix}`;
      }

      const now = new Date().toISOString();
      const user: StoredUser = {
        id: createId(),
        email: payload.email,
        username: candidate,
        locale,
        theme: options.config.defaultTheme,
        providers: ["google"],
        createdAt: now,
        updatedAt: now
      };

      await options.repositories.users.create(user);
      await findOrCreateProfile(options.repositories, user);
      return user;
    },
    registerWithCredentials: async (
      email: string,
      username: string,
      password: string,
      locale: StoredUser["locale"]
    ) => {
      const [existingEmail, existingUsername] = await Promise.all([
        options.repositories.users.findByEmail(email),
        options.repositories.users.findByUsername(username)
      ]);

      if (existingEmail) {
        throw new Error("Email ja cadastrado.");
      }

      if (existingUsername) {
        throw new Error("Username ja cadastrado.");
      }

      const now = new Date().toISOString();
      const user: StoredUser = {
        id: createId(),
        email,
        username,
        locale,
        theme: options.config.defaultTheme,
        providers: ["credentials"],
        passwordHash: hashPassword(password),
        createdAt: now,
        updatedAt: now
      };

      await options.repositories.users.create(user);
      await findOrCreateProfile(options.repositories, user);
      return user;
    },
    createSession: async (reply: FastifyReply, userId: string) => {
      const session: SessionRecord = {
        id: createId(),
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
      };

      await options.repositories.sessions.create(session);

      reply.setCookie(SESSION_COOKIE, session.id, {
        ...createCookieOptions(options.config),
        maxAge: SESSION_TTL_MS / 1000
      });
    },
    clearSession: async (reply: FastifyReply, request: FastifyRequest) => {
      const sessionId = request.cookies[SESSION_COOKIE];

      if (sessionId) {
        await options.repositories.sessions.deleteById(sessionId);
      }

      reply.clearCookie(SESSION_COOKIE, createCookieOptions(options.config));
    }
  });
});
