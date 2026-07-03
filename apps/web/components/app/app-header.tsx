"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavItems } from "../../lib/routes";
import { AlertsMenu } from "./alerts-menu";
import { UserMenu } from "./user-menu";

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/app" className="flex items-center gap-2 font-extrabold">
          <span className="field-grid grid h-9 w-9 place-items-center rounded-lg bg-field text-sm text-white">NB</span>
          <span>NaBola</span>
        </Link>

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
                <Icon size={17} />
                {item.label}
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
