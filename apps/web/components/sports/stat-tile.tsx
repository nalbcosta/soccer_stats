import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";

type StatTileTone = "neutral" | "primary" | "field" | "marker";

const toneClass: Record<StatTileTone, string> = {
  neutral: "text-text",
  primary: "text-primary-strong",
  field: "text-field",
  marker: "text-warning"
};

export function StatTile({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon?: LucideIcon;
  tone?: StatTileTone;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-muted">{label}</p>
          <p className={clsx("mt-2 text-3xl font-black leading-none tabular-nums", toneClass[tone])}>{value}</p>
        </div>
        {Icon ? (
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary-soft text-primary-strong">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
      {helper ? <p className="mt-3 text-sm font-semibold text-muted">{helper}</p> : null}
    </Card>
  );
}
