import type { AppConfig } from "./types.js";

export const loadConfig = (): AppConfig => {
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

  return {
    port: Number(process.env.PORT ?? 4000),
    mongodbUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017",
    mongodbDb: process.env.MONGODB_DB ?? "soccer_stats",
    webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    sessionSecret: process.env.SESSION_SECRET ?? "change-me",
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    nodeEnv: (process.env.NODE_ENV as AppConfig["nodeEnv"] | undefined) ?? "development",
    ...(cookieDomain ? { cookieDomain } : {}),
    defaultLocale: "pt-BR",
    defaultTheme: "system"
  };
};
