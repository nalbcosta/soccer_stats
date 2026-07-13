"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { secondaryNavItems } from "../../lib/routes";
import { Button } from "../ui/button";
import { MenuShell } from "./menu-shell";
import { useTranslations } from "../../i18n/provider";

export function MoreMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("navigation");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        className="relative flex h-full min-h-touch w-full flex-col items-center justify-center gap-1 rounded-none border-0 bg-transparent px-0 text-[11px] font-black text-muted shadow-none hover:bg-transparent"
        type="button"
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Menu size={20} />
        <span>{t("more")}</span>
      </Button>

      <MenuShell mobileFullScreen onClose={() => setOpen(false)} open={open}>
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="text-xs font-black uppercase text-muted">{t("moreTabs")}</p>
            <p className="text-sm font-semibold text-muted">{t("moreDescription")}</p>
          </div>
          <Button className="min-h-9 px-2" type="button" variant="ghost" onClick={() => setOpen(false)} title={t("close")}>
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid gap-2">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  className={`flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${
                    active ? "bg-primary-soft text-primary-strong" : "text-text hover:bg-canvas"
                  }`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>
        </div>
      </MenuShell>
    </>
  );
}
