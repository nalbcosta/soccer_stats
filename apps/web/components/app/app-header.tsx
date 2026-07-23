"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavItems } from "../../lib/routes";
import { AppBackButton } from "./app-back-button";
import { AlertsMenu } from "./alerts-menu";
import { UserMenu } from "./user-menu";
import { useTranslations } from "../../i18n/provider";

export function AppHeader() {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-14 md:max-w-7xl items-center justify-between gap-3 px-3 sm:px-5 md:h-20 ">
        <div className="flex min-w-0 items-center gap-2">
          <AppBackButton />
          <Link href="/app" className="flex min-w-0 items-center gap-2 font-extrabold" aria-label={t("goHome")}>
            <span className="field-grid grid h-10 w-10 place-items-center rounded-lg bg-field text-sm text-white">NB</span>
            <span className="hidden sm:inline">NaBola</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex lg:hidden">
          {appNavItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold ${
                  active ? "bg-primary-soft text-primary-strong" : "text-muted hover:text-text"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon size={18} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <AlertsMenu mode="header" />
          <UserMenu mode="header" />
        </div>
      </div>
    </header>
  );
}
