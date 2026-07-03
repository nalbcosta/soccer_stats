import Link from "next/link";
import { CircleDot } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-5 text-sm shadow-line">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary-strong">
        <CircleDot size={20} />
      </div>
      <p className="mt-3 font-black text-text">{title}</p>
      <p className="mt-1 text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-glow"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
