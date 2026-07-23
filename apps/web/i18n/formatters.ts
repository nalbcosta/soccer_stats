import type { Locale } from "./config";

export function formatDateTime(value: Date | string | number, locale: Locale, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatMatchDate(value: Date | string | number, locale: Locale) {
  return formatDateTime(value, locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).replace(",", " •");
}

export function formatTime(value: Date | string | number, locale: Locale) {
  return formatDateTime(value, locale, { hour: "2-digit", minute: "2-digit" });
}
