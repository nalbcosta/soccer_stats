import clsx from "clsx";

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-lg bg-surface-raised shadow-line", className)} />;
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div className="rounded-lg border border-border bg-surface p-4 shadow-line" key={index}>
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-md" />
            <div className="grid flex-1 gap-2">
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
            <SkeletonBlock className="h-8 w-14 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
