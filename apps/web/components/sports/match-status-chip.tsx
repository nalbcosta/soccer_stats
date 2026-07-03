import type { MatchStatus } from "@soccer-stats/shared";
import { CalendarClock, CheckCircle2, type LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";

const statusCopy: Record<MatchStatus, { label: string; tone: "success" | "warning"; icon: LucideIcon }> = {
  scheduled: {
    label: "Marcado",
    tone: "warning",
    icon: CalendarClock
  },
  completed: {
    label: "Placar fechado",
    tone: "success",
    icon: CheckCircle2
  }
};

export function MatchStatusChip({ status }: { status: MatchStatus }) {
  const copy = statusCopy[status];
  const Icon = copy.icon;

  return (
    <Badge tone={copy.tone} className="gap-1.5 whitespace-nowrap">
      <Icon size={13} strokeWidth={2.4} />
      {copy.label}
    </Badge>
  );
}
