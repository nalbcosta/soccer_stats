"use client";

import type { MatchStatus } from "@soccer-stats/shared";
import { CalendarClock, CheckCircle2, CircleHelp, XCircle, type LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { useTranslations } from "../../i18n/provider";

const statusCopy: Record<MatchStatus, { label: string; tone: "success" | "warning"; icon: LucideIcon }> = {
  scheduled: {
    label: "statusScheduled",
    tone: "warning",
    icon: CalendarClock
  },
  confirming: {
    label: "statusConfirming",
    tone: "warning",
    icon: CircleHelp
  },
  completed: {
    label: "statusCompleted",
    tone: "success",
    icon: CheckCircle2
  },
  cancelled: {
    label: "statusCancelled",
    tone: "warning",
    icon: XCircle
  }
};

export function MatchStatusChip({ status }: { status: MatchStatus }) {
  const t = useTranslations("match");
  const copy = statusCopy[status];
  const Icon = copy.icon;

  return (
    <Badge tone={copy.tone} className="gap-1.5 whitespace-nowrap">
      <Icon size={13} strokeWidth={2.4} />
      {t(copy.label)}
    </Badge>
  );
}
