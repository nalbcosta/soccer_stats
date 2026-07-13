import Link from "next/link";
import { ArrowRight, CircleAlert, CircleCheck, Clock3 } from "lucide-react";
import type { DashboardActionItem } from "../../lib/dashboard/dashboard-notification-selectors";
import { Card } from "../ui/card";
import { useTranslations } from "../../i18n/provider";

const toneClass: Record<DashboardActionItem["tone"], string> = {
  primary: "bg-primary-soft text-primary-strong",
  warning: "bg-warning-soft text-text",
  neutral: "bg-canvas text-muted"
};

const toneIcon = {
  primary: CircleCheck,
  warning: CircleAlert,
  neutral: Clock3
};

export function DashboardActionQueue({ actions }: { actions: DashboardActionItem[] }) {
  const t = useTranslations("dashboard");
  return (
    <section className="grid gap-3">
      <div>
        <p className="text-xs font-black uppercase text-field">{t("actionQueue")}</p>
        <h2 className="mt-1 text-xl font-black">{t("actionQueueTitle")}</h2>
      </div>

      <div className="grid gap-2">
        {actions.map((action) => {
          const Icon = toneIcon[action.tone];

          return (
            <Card className="p-3" key={action.key}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${toneClass[action.tone]}`}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black leading-tight">{action.title}</p>
                  <p className="mt-1 text-sm font-semibold text-muted">{action.description}</p>
                </div>
                <Link
                  className="inline-flex min-h-9 w-full shrink-0 items-center justify-center gap-1 rounded-md bg-canvas px-2.5 text-xs font-black text-primary-strong sm:w-auto"
                  href={action.href}
                >
                  {action.actionLabel}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
