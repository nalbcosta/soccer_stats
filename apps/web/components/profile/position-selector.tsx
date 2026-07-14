"use client";

import clsx from "clsx";
import type { PlayerProfile } from "@soccer-stats/shared";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, CircleDot, Crosshair, Goal, Shield, ShieldCheck, Swords, Target, Waves, Zap } from "lucide-react";
import { useTranslations } from "../../i18n/provider";

type Position = PlayerProfile["preferredPosition"];

const positions: Array<{ value: Position; icon: LucideIcon; label: string }> = [
  { value: "goalkeeper", icon: Goal, label: "positionGoalkeeper" },
  { value: "right-back", icon: Shield, label: "positionRightBack" },
  { value: "center-back", icon: ShieldCheck, label: "positionCenterBack" },
  { value: "left-back", icon: Shield, label: "positionLeftBack" },
  { value: "defensive-midfielder", icon: Crosshair, label: "positionDefensiveMidfielder" },
  { value: "central-midfielder", icon: CircleDot, label: "positionCentralMidfielder" },
  { value: "attacking-midfielder", icon: Zap, label: "positionAttackingMidfielder" },
  { value: "right-winger", icon: ArrowUpRight, label: "positionRightWinger" },
  { value: "left-winger", icon: Waves, label: "positionLeftWinger" },
  { value: "striker", icon: Target, label: "positionStriker" }
];

export function PositionSelector({ value, onChange }: { value: Position; onChange: (position: Position) => void }) {
  const t = useTranslations("profile");

  return (
    <div aria-label={t("preferredPosition")} className="grid grid-cols-2 gap-2" role="radiogroup">
      {positions.map(({ value: position, icon: Icon, label }) => {
        const selected = position === value;

        return (
          <button
            aria-checked={selected}
            className={clsx(
              "flex min-h-12 items-center gap-2 rounded-lg border px-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary",
              selected ? "border-primary bg-primary-soft text-primary-strong" : "border-border bg-surface text-text hover:border-primary/55"
            )}
            key={position}
            role="radio"
            type="button"
            onClick={() => onChange(position)}
          >
            <Icon aria-hidden="true" size={17} />
            <span className="min-w-0 leading-tight">{t(label)}</span>
          </button>
        );
      })}
    </div>
  );
}
