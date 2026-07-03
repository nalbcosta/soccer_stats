import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export interface TabItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  active?: boolean;
}

export function Tabs({ items, label = "Navegacao da secao" }: { items: TabItem[]; label?: string }) {
  return (
    <nav className="mb-4 overflow-x-auto" aria-label={label}>
      <div className="inline-flex min-w-full gap-1 rounded-lg border border-border bg-surface p-1 shadow-line">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className={clsx(
                "inline-flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-black transition",
                item.active ? "bg-primary-soft text-primary-strong" : "text-muted hover:bg-canvas hover:text-text"
              )}
              href={item.href}
              key={item.href}
            >
              {Icon ? <Icon size={16} /> : null}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
