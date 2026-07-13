import Link from "next/link";
import type { Notification } from "@soccer-stats/shared";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useTranslations } from "../../i18n/provider";

export function DashboardNotificationsPreview({
  notifications,
  onReadAll,
  refreshing
}: {
  notifications: Notification[];
  onReadAll: () => Promise<void>;
  refreshing: boolean;
}) {
  const t = useTranslations("dashboard");
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-field">{t("alerts")}</p>
          <h2 className="mt-1 text-xl font-black">{t("recentNotes")}</h2>
        </div>
        {notifications.length > 0 ? (
          <Button className="min-h-9 px-3 text-xs" disabled={refreshing} onClick={() => void onReadAll()} type="button" variant="secondary">
            <CheckCheck size={15} />
            {t("readAll")}
          </Button>
        ) : null}
      </div>

      <Card className="p-4">
        {notifications.length === 0 ? (
          <div className="grid gap-2 text-sm text-muted">
            <Bell className="text-primary-strong" size={20} />
            <p className="font-bold">{t("allGood")}</p>
            <p>{t("alertsDescription")}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {notifications.map((notification) => (
              <Link className="rounded-lg bg-canvas p-3" href="/app/notifications" key={notification.id}>
                <p className="font-black leading-tight">{notification.title}</p>
                <p className="mt-1 text-sm font-semibold text-muted">{notification.message}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
