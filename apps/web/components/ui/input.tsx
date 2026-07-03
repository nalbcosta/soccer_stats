import clsx from "clsx";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary",
        className
      )}
      {...props}
    />
  );
}
