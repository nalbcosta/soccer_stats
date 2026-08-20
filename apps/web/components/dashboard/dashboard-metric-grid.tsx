import { CalendarDays, Trophy, Users, type LucideIcon } from "lucide-react";
import type { DashboardMetric } from "../../lib/dashboard/dashboard-metrics";
import { Card } from "../ui/card";

const metricIcons: Record<DashboardMetric["key"], LucideIcon> = {
  teams: Users,
  matches: CalendarDays,
  tournaments: Trophy
};

export function DashboardMetricGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <section className="flex flex-wrap gap-3">
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.key];

        return (
          <Card className="min-w-[9.5rem] flex-1 p-3 sm:min-w-[12.5rem] sm:p-4" key={metric.key}>
            <div className="flex items-center justify-between">
              <Icon className="text-primary-strong" size={18} />
              <span className="rounded-sm bg-primary-soft px-2 py-1 text-[11px] font-black uppercase text-primary-strong">
                {metric.label}
              </span>
            </div>
            <p className="mt-3 text-2xl font-black tabular-nums sm:text-3xl">{metric.value}</p>
            <p className="text-sm font-semibold text-muted">{metric.helper}</p>
          </Card>
        );
      })}
    </section>
  );
}
