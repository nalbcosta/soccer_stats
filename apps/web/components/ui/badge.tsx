import clsx from "clsx";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info" | "primary";

const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-canvas text-muted",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-text",
  error: "bg-error-soft text-error",
  info: "bg-info-soft text-info",
  primary: "bg-primary-soft text-primary-strong"
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
}) {
  return (
    <span
      className={clsx(
        "inline-flex min-h-7 items-center rounded-sm px-2.5 text-[11px] font-black uppercase",
        toneClass[tone],
        className
      )}
      {...props}
    />
  );
}
