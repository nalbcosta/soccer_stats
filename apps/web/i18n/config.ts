export const locales = ["pt-BR", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt-BR";
export const localeCookieName = "soccer-stats-locale";

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function inferLocale(languageHeader: string | null): Locale {
  return languageHeader?.toLowerCase().includes("pt") ? "pt-BR" : "en";
}
