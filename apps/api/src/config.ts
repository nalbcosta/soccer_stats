import type { AppConfig } from "./types.js";

export const normalizeOrigin = (origin: string): string => origin.trim().replace(/\/+$/, "");

export const loadConfig = (): AppConfig => {
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

  return {
    port: Number(process.env.PORT ?? 4000),
    mongodbUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017",
    mongodbDb: process.env.MONGODB_DB ?? "soccer_stats",
    webOrigin: normalizeOrigin(process.env.WEB_ORIGIN ?? "http://localhost:3000"),
    sessionSecret: process.env.SESSION_SECRET ?? "change-me",
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    nodeEnv: (process.env.NODE_ENV as AppConfig["nodeEnv"] | undefined) ?? "development",
    ...(cookieDomain ? { cookieDomain } : {}),
    defaultLocale: "pt-BR",
    defaultTheme: "system",
    nominatimBaseUrl: process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org",
    nominatimUserAgent: process.env.NOMINATIM_USER_AGENT ?? "NaBola/1.0 (local development)",
    ...(process.env.NOMINATIM_EMAIL ? { nominatimEmail: process.env.NOMINATIM_EMAIL } : {}),
    siteAdminEmails: (process.env.SITE_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  };
};
