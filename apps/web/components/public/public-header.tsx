"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
import { landingContent } from "../../i18n/messages/landing";
import { useLocale } from "../../i18n/provider";
import { LocaleToggleButton, ThemeToggleButton } from "./landing/landing-shared";

export function PublicHeader() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const content = landingContent[locale];
  const isLoginPage = pathname === "/login";
  const isTermsPage = pathname === "/termos";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 font-black" aria-label="NaBola">
          <span className="field-grid relative grid h-10 w-10 place-items-center rounded-lg bg-field text-sm text-white shadow-line">NB</span>
          <span className="hidden truncate text-lg sm:block">NaBola</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:flex-wrap sm:justify-end">
          <div className="grid min-w-0 gap-1">
            <p className="hidden px-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted sm:block">{content.nav.localeLabel}</p>
            <LocaleToggleButton />
          </div>
          <div className="grid min-w-0 gap-1">
            <p className="hidden px-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted sm:block">{content.nav.themeLabel}</p>
            <ThemeToggleButton />
          </div>
          {isTermsPage ? (
            <Link className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-bold text-muted shadow-line transition hover:text-text" href="/">
              <ArrowLeft size={17} />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
          ) : isLoginPage ? null : (
            <Link
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-glow sm:w-auto sm:px-4"
              href="/login"
              title={content.nav.login}
              aria-label={content.nav.login}
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">{content.nav.login}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
