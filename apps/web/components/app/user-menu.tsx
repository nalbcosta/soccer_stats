"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, LogOut, Settings, UserRound, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "../../i18n/provider";
import { LocaleToggle } from "../locale-toggle";
import { ThemeToggle } from "../theme-toggle";
import { ConfirmDialog } from "../overlays/confirm-dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useSession } from "./session-provider";
import { MenuShell } from "./menu-shell";

type UserMenuMode = "header" | "mobile";

export function UserMenu({ mode }: { mode: UserMenuMode }) {
  const { user, logout, dashboard } = useSession();
  const { resolvedTheme } = useTheme();
  const { locale } = useLocale();
  const t = useTranslations("navigation");
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const pendingCount =
    (dashboard?.invites.filter((invite) => invite.status === "pending").length ?? 0) +
    (dashboard?.matches.filter((match) => match.status === "scheduled").length ?? 0);

  const displayName = dashboard?.profile?.displayName ?? user?.username ?? "jogador";
  const initials = displayName.slice(0, 2).toUpperCase();
  const localeLabel = locale === "pt-BR" ? "PT-BR" : "EN";
  const themeLabel = resolvedTheme === "dark" ? "Escuro" : resolvedTheme === "light" ? "Claro" : "Auto";

  return (
    <>
      <Button
        className={
          mode === "header"
            ? "h-10 min-h-10 gap-2 rounded-xl px-2 md:h-11 md:px-3.5"
            : "relative flex h-full min-h-touch w-full items-center justify-center rounded-none border-0 bg-transparent px-0 text-[11px] font-black text-muted shadow-none hover:bg-transparent"
        }
        type="button"
        variant={mode === "header" ? "secondary" : "ghost"}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {mode === "header" ? (
          <>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-field text-xs font-black text-white md:h-8 md:w-8 md:rounded-md">
              {initials}
            </span>
            <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">@{displayName}</span>
            <ChevronDown className="hidden md:block" size={16} />
          </>
        ) : (
          <>
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary-strong">
              <UserRound size={18} />
              {pendingCount > 0 ? (
                <Badge className="absolute -right-1 -top-1 min-h-5 px-1.5 text-[10px]" tone="warning">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </Badge>
              ) : null}
            </span>
            <span className="sr-only">Perfil</span>
          </>
        )}
      </Button>

      <MenuShell mobileFullScreen onClose={() => setOpen(false)} open={open}>
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase text-muted">Conta</p>
            <p className="text-lg font-black leading-none">{displayName}</p>
            <p className="text-sm font-semibold text-muted">
              {dashboard?.profile?.stats.recentHighlight ?? "Seu perfil, ajustes e preferencias em um so lugar."}
            </p>
          </div>
          <Button className="min-h-9 px-2" type="button" variant="ghost" onClick={() => setOpen(false)} title="Fechar">
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid gap-2">
            <Link
              className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text hover:bg-canvas"
              href="/app/profile"
              onClick={() => setOpen(false)}
            >
              <UserRound size={16} />
              {t("profile")}
            </Link>
            <Link
              className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text hover:bg-canvas"
              href="/app/settings"
              onClick={() => setOpen(false)}
            >
              <Settings size={16} />
              {t("settings")}
            </Link>
          </div>

          <div className="mt-3 rounded-lg bg-canvas p-3">
            <p className="mb-3 text-xs font-black uppercase text-muted">Preferencias</p>
            <div>
              <p className="mb-2 text-xs font-black uppercase text-muted">
                {t("language")}
                <span className="ml-2 font-semibold normal-case text-muted">{localeLabel}</span>
              </p>
              <LocaleToggle compact />
            </div>
            <div className="mt-3">
              <p className="mb-2 text-xs font-black uppercase text-muted">
                {t("theme")}
                <span className="ml-2 font-semibold normal-case text-muted">{themeLabel}</span>
              </p>
              <ThemeToggle compact />
            </div>
          </div>

          <Button
            className="mt-3 w-full justify-start"
            type="button"
            variant="secondary"
            onClick={() => {
              setOpen(false);
              setConfirmLogout(true);
            }}
          >
            <LogOut size={16} />
            {t("signOut")}
          </Button>
        </div>
      </MenuShell>

      <ConfirmDialog
        confirmLabel="Sair"
        description="Voce volta para o login e pode entrar de novo quando quiser."
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => void logout()}
        open={confirmLogout}
        title="Sair da conta?"
      />
    </>
  );
}
