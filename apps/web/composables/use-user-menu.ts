"use client";

import type { LucideIcon } from "lucide-react";
import { Settings, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "../i18n/provider";
import { useSession } from "../components/app/session-provider";
import { resolveApiAssetUrl } from "../lib/api";

export interface UserMenuLink {
  href: string;
  icon: LucideIcon;
  label: string;
}

const localeLabels = {
  "pt-BR": "PT",
  en: "EN"
} as const;

export function useUserMenu() {
  const { dashboard, logout, user } = useSession();
  const { locale } = useLocale();
  const { resolvedTheme, theme } = useTheme();
  const text = useTranslations("navigation");
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const displayName = dashboard?.profile?.displayName ?? user?.username ?? text("playerFallback");
  const initials = displayName.slice(0, 2).toUpperCase();
  const photoUrl = dashboard?.profile?.photoUrl ? resolveApiAssetUrl(dashboard.profile.photoUrl) : null;
  const themeKey = theme === "dark" || theme === "light" || theme === "system"
    ? theme === "system" ? "auto" : theme
    : resolvedTheme === "dark" ? "dark" : resolvedTheme === "light" ? "light" : "auto";
  const accountLinks = useMemo<UserMenuLink[]>(
    () => [
      { href: "/app/profile", icon: UserRound, label: text("profile") },
      { href: "/app/settings", icon: Settings, label: text("settings") }
    ],
    [text]
  );

  const requestLogout = () => {
    setOpen(false);
    setConfirmLogout(true);
  };

  return {
    accountLinks,
    accountSummary: dashboard?.profile?.stats.recentHighlight ?? text("accountDescription"),
    buttonRef,
    confirmLogout,
    displayName,
    initials,
    photoUrl,
    publicIdentifier: user?.publicIdentifier ?? "",
    localeLabel: localeLabels[locale],
    logout,
    open,
    requestLogout,
    setConfirmLogout,
    setOpen,
    text,
    themeKey
  };
}
