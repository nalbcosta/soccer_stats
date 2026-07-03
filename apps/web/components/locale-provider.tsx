"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Locale = "pt-BR" | "en";

const dictionaries = {
  "pt-BR": {
    heroTag: "Soccer Stats",
    heroTitle: "Organize sua pelada com cara de produto serio.",
    heroText:
      "Crie times, campeonatos e partidas entre amigos, acompanhe desempenho e gere insights claros sem complicar a resenha.",
    authTitle: "Entrar ou criar conta",
    email: "Email",
    username: "Username",
    password: "Senha",
    signUp: "Criar conta",
    signIn: "Entrar",
    google: "Entrar com Google",
    dashboard: "Seu painel",
    teams: "Times",
    tournaments: "Campeonatos",
    matches: "Partidas",
    invites: "Convites",
    stats: "Estatisticas",
    createTeam: "Criar time",
    createTournament: "Criar campeonato",
    createMatch: "Criar partida",
    completeMatch: "Fechar partida",
    darkMode: "Tema",
    locale: "Idioma",
    recentForm: "Momento atual",
    noData: "Sem dados ainda.",
    homeTeam: "Time da casa",
    awayTeam: "Time visitante",
    matchDate: "Data da partida",
    displayName: "Nome de exibicao",
    preferredFoot: "Pe preferido",
    preferredPosition: "Posicao",
    bio: "Bio",
    saveProfile: "Salvar perfil",
    refresh: "Atualizar painel",
    signOut: "Sair"
  },
  en: {
    heroTag: "Soccer Stats",
    heroTitle: "Run your pickup games like a serious product.",
    heroText:
      "Create teams, tournaments and matches with friends, track performance and get clear insights without killing the vibe.",
    authTitle: "Sign in or create account",
    email: "Email",
    username: "Username",
    password: "Password",
    signUp: "Create account",
    signIn: "Sign in",
    google: "Continue with Google",
    dashboard: "Your dashboard",
    teams: "Teams",
    tournaments: "Tournaments",
    matches: "Matches",
    invites: "Invites",
    stats: "Stats",
    createTeam: "Create team",
    createTournament: "Create tournament",
    createMatch: "Create match",
    completeMatch: "Complete match",
    darkMode: "Theme",
    locale: "Language",
    recentForm: "Current form",
    noData: "No data yet.",
    homeTeam: "Home team",
    awayTeam: "Away team",
    matchDate: "Match date",
    displayName: "Display name",
    preferredFoot: "Preferred foot",
    preferredPosition: "Position",
    bio: "Bio",
    saveProfile: "Save profile",
    refresh: "Refresh dashboard",
    signOut: "Sign out"
  }
} as const;

type Dictionary = (typeof dictionaries)[Locale];

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (value: Locale) => void;
  dictionary: Dictionary;
}>({
  locale: "pt-BR",
  setLocale: () => undefined,
  dictionary: dictionaries["pt-BR"]
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt-BR");

  useEffect(() => {
    const stored = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("soccer-stats-locale="))
      ?.split("=")[1] as Locale | undefined;

    if (stored === "pt-BR" || stored === "en") {
      setLocaleState(stored);
      return;
    }

    const inferred = navigator.language.toLowerCase().includes("pt") ? "pt-BR" : "en";
    setLocaleState(inferred);
    document.cookie = `soccer-stats-locale=${inferred}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const setLocale = (value: Locale) => {
    setLocaleState(value);
    document.cookie = `soccer-stats-locale=${value}; path=/; max-age=31536000; samesite=lax`;
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      dictionary: dictionaries[locale]
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
