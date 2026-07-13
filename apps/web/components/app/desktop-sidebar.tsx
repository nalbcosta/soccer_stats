"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavItems, secondaryNavItems } from "../../lib/routes";
import { useTranslations } from "../../i18n/provider";

export function DesktopSidebar() {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 grid gap-5">
        <nav className="grid gap-1" aria-label={t("game")}>
          <p className="px-2 text-[11px] font-black uppercase text-muted">{t("game")}</p>
          {appNavItems.map((item) => (
            <SidebarLink active={pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))} item={item} key={item.href} />
          ))}
        </nav>

        <nav className="grid gap-1" aria-label={t("club")}>
          <p className="px-2 text-[11px] font-black uppercase text-muted">{t("club")}</p>
          {secondaryNavItems.map((item) => (
            <SidebarLink active={pathname === item.href || pathname.startsWith(item.href)} item={item} key={item.href} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function SidebarLink({
  active,
  item
}: {
  active: boolean;
  item: (typeof appNavItems)[number];
}) {
  const t = useTranslations("navigation");
  const Icon = item.icon;

  return (
    <Link
      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-black transition ${
        active ? "bg-primary-soft text-primary-strong" : "text-muted hover:bg-surface hover:text-text"
      }`}
      href={item.href}
    >
      <Icon size={18} strokeWidth={active ? 2.6 : 2} />
      {t(item.labelKey)}
    </Link>
  );
}
