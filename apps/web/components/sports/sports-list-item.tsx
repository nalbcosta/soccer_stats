import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";

export function SportsListItem({
  href,
  title,
  description,
  icon: Icon,
  trailing,
  meta,
  tone = "primary"
}: {
  href: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  trailing?: React.ReactNode;
  meta?: React.ReactNode;
  tone?: "primary" | "field" | "marker";
}) {
  return (
    <Link href={href}>
      <Card className="p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start gap-3">
          <div
            className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-md", {
              "bg-primary-soft text-primary-strong": tone === "primary",
              "bg-field-soft text-field": tone === "field",
              "bg-marker-soft text-warning": tone === "marker"
            })}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-black">{title}</p>
            {description ? <p className="mt-1 text-sm font-semibold text-muted">{description}</p> : null}
            {meta ? <div className="mt-3">{meta}</div> : null}
          </div>
          {trailing ? <div className="shrink-0">{trailing}</div> : null}
        </div>
      </Card>
    </Link>
  );
}
