"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreMenu } from "./more-menu";
import { appNavItems } from "../../lib/routes";

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface md:hidden" aria-label="Navegação principal">
      <div className="grid min-h-nav grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {appNavItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              className={`flex min-h-touch flex-col items-center justify-center gap-1 text-[11px] font-black ${
                active ? "text-primary-strong" : "text-muted"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon size={19} strokeWidth={active ? 2.6 : 2} />
              {item.label}
            </Link>
          );
        })}
        <MoreMenu />
      </div>
    </nav>
  );
}
