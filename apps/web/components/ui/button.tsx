import clsx from "clsx";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-primary text-white shadow-glow hover:bg-primary-hover active:bg-primary-pressed": variant === "primary",
          "border border-border bg-surface text-text shadow-line": variant === "secondary",
          "text-muted hover:text-text": variant === "ghost"
        },
        className
      )}
      {...props}
    />
  );
}
