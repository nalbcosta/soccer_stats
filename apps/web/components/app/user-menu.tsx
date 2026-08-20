"use client";

import Link from "next/link";
import { ChevronDown, LogOut, X } from "lucide-react";
import { useUserMenu } from "../../composables/use-user-menu";
import { useTranslations } from "../../i18n/provider";
import { LocaleToggle } from "../locale-toggle";
import { ThemeToggle } from "../theme-toggle";
import { ConfirmDialog } from "../overlays/confirm-dialog";
import { Button } from "../ui/button";
import { UserAvatar } from "../ui/user-avatar";
import { MenuShell } from "./menu-shell";

type UserMenuMode = "header" | "mobile";

export function UserMenu({ mode }: { mode: UserMenuMode }) {
  const commonText = useTranslations("common");
  const {
    accountLinks,
    accountSummary,
    buttonRef,
    confirmLogout,
    displayName,
    initials,
    photoUrl,
    publicIdentifier,
    localeLabel,
    logout,
    open,
    requestLogout,
    setConfirmLogout,
    setOpen,
    text,
    themeKey
  } = useUserMenu();

  const isHeader = mode === "header";

  return (
    <>
      <Button
        ref={buttonRef}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={text("accountMenu")}
        className={
          isHeader
            ? "h-11 min-h-11 rounded-xl px-1.5 sm:px-2 md:gap-2.5 md:px-3"
            : "flex h-full min-h-touch w-full flex-col items-center justify-center gap-1 rounded-none border-0 bg-transparent px-0 text-[11px] font-black text-muted shadow-none hover:bg-transparent"
        }
        type="button"
        variant={isHeader ? "secondary" : "ghost"}
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar alt={text("profilePhotoAlt")} className="h-9 w-9" initials={initials} src={photoUrl} />
        {isHeader ? (
          <>
            <span className="hidden min-w-0 max-w-32 flex-col items-start md:flex">
              <span className="w-full truncate text-sm font-bold leading-4">@{displayName}</span>
              {publicIdentifier ? <span className="font-mono text-[10px] font-black leading-3 text-primary-strong">{publicIdentifier}</span> : null}
            </span>
            <ChevronDown className={`hidden text-muted transition-transform md:block ${open ? "rotate-180" : ""}`} size={16} />
          </>
        ) : (
          <span>{text("profile")}</span>
        )}
      </Button>

      <MenuShell anchorRef={buttonRef} mobileFullScreen onClose={() => setOpen(false)} open={open}>
        <div className="border-b border-border bg-canvas/65 px-4 py-4 md:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar alt={text("profilePhotoAlt")} className="h-11 w-11 rounded-xl text-sm" initials={initials} src={photoUrl} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">{text("account")}</p>
                <div className="flex min-w-0 items-baseline gap-2">
                  <p className="min-w-0 truncate text-lg font-black leading-tight">{displayName}</p>
                  {publicIdentifier ? <p className="shrink-0 font-mono text-sm font-black text-primary-strong">{publicIdentifier}</p> : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-muted">{accountSummary}</p>
              </div>
            </div>
            <Button aria-label={commonText("close")} className="min-h-9 shrink-0 px-2" type="button" variant="ghost" onClick={() => setOpen(false)}>
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          <nav className="grid grid-cols-2 gap-2" aria-label={text("accountNavigation")}>
            {accountLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex min-h-16 flex-col justify-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm font-bold text-text transition hover:border-primary/30 hover:bg-primary-soft/40"
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="text-primary-strong" size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <section className="mt-4 rounded-xl border border-border bg-canvas p-3.5" aria-labelledby="preferences-title">
            <div className="flex items-baseline justify-between gap-3">
              <p id="preferences-title" className="text-xs font-black uppercase tracking-[0.12em] text-muted">{text("preferences")}</p>
              <p className="text-xs font-semibold text-muted">{text("preferencesDescription")}</p>
            </div>
            <div className="mt-4 grid gap-4">
              <PreferenceRow label={text("language")} value={localeLabel}>
                <LocaleToggle compact />
              </PreferenceRow>
              <PreferenceRow label={text("theme")} value={text(themeKey)}>
                <ThemeToggle compact />
              </PreferenceRow>
            </div>
          </section>

          <Button className="mt-4 w-full justify-center text-error hover:text-error" type="button" variant="secondary" onClick={requestLogout}>
            <LogOut size={17} />
            {text("signOut")}
          </Button>
        </div>
      </MenuShell>

      <ConfirmDialog
        confirmLabel={text("confirmSignout")}
        description={text("signoutDescription")}
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => void logout()}
        open={confirmLogout}
        title={text("signOut")}
      />
    </>
  );
}

function PreferenceRow({
  children,
  label,
  value
}: {
  children: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.1em] text-muted">{label}</p>
        <p className="text-xs font-bold text-text">{value}</p>
      </div>
      {children}
    </div>
  );
}
