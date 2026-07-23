"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultLocale, inferLocale, isLocale, localeCookieName, type Locale } from "./config";
import { messages, type MessageNamespace } from "./messages";

interface MessageTree {
  [key: string]: string | MessageTree;
}

function resolveMessage(tree: MessageTree, path: string): string {
  const value = path.split(".").reduce<string | MessageTree | undefined>((current, segment) => {
    if (!current || typeof current === "string") return undefined;
    return current[segment];
  }, tree);
  return typeof value === "string" ? value : path;
}

function createTranslator(locale: Locale, namespace: MessageNamespace) {
  return (key: string, values?: Record<string, string | number>) => {
    const message = resolveMessage(messages[locale][namespace] as MessageTree, key);
    return values ? Object.entries(values).reduce((result, [name, value]) => result.replaceAll(`{${name}}`, String(value)), message) : message;
  };
}

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (namespace: MessageNamespace, key: string, values?: Record<string, string | number>) => string };

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => undefined,
  t: (namespace, key, values) => createTranslator(defaultLocale, namespace)(key, values)
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  useEffect(() => {
    const stored = document.cookie.split("; ").find((entry) => entry.startsWith(`${localeCookieName}=`))?.split("=")[1];
    const nextLocale = isLocale(stored) ? stored : inferLocale(navigator.language);
    setLocaleState(nextLocale);
    if (!isLocale(stored)) document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
  };
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: (namespace: MessageNamespace, key: string, values?: Record<string, string | number>) => createTranslator(locale, namespace)(key, values) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }
export function useTranslations(namespace: MessageNamespace) {
  const { locale } = useLocale();
  return useMemo(() => createTranslator(locale, namespace), [locale, namespace]);
}
