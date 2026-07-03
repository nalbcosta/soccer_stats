import clsx from "clsx";

export function ComparisonBar({
  label,
  value,
  max,
  helper,
  tone = "primary"
}: {
  label: string;
  value: number;
  max: number;
  helper?: string;
  tone?: "primary" | "field" | "marker";
}) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black">{label}</p>
        <p className="text-sm font-black tabular-nums">{value}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-canvas">
        <div
          className={clsx("h-full rounded-sm", {
            "bg-primary": tone === "primary",
            "bg-field": tone === "field",
            "bg-marker": tone === "marker"
          })}
          style={{ width: `${percent}%` }}
        />
      </div>
      {helper ? <p className="text-xs font-semibold text-muted">{helper}</p> : null}
    </div>
  );
}
