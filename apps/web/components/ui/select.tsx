import clsx from "clsx";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none transition focus:border-primary",
        className
      )}
      {...props}
    />
  );
}
