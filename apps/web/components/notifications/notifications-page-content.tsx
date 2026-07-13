"use client";

import Link from "next/link";
import { Bell, CalendarDays, MailPlus } from "lucide-react";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { EmptyState } from "../feedback/empty-state";
import { LoadingState } from "../feedback/loading-state";
import { MatchStatusChip } from "../sports/match-status-chip";
import { Card } from "../ui/card";
import { useLocale, useTranslations } from "../../i18n/provider";
import { formatDateTime } from "../../i18n/formatters";

export function NotificationsPageContent() {
  const { dashboard } = useSession();
  const { locale } = useLocale();
  const t = useTranslations("match");
  const dashboardText = useTranslations("dashboard");

  if (!dashboard) {
    return <LoadingState label="Abrindo avisos..." />;
  }

  const scheduled = dashboard.matches.filter((match) => match.status === "scheduled").slice(0, 5);
  const pendingInvites = dashboard.invites.filter((invite) => invite.status === "pending");
  const hasNotifications = scheduled.length > 0 || pendingInvites.length > 0;

  return (
    <>
      <PageHeading eyebrow={dashboardText("alerts")} title={dashboardText("notificationsTitle")} />
      {!hasNotifications ? (
        <EmptyState title={dashboardText("notificationsEmpty")} description={dashboardText("notificationsDescription")} />
      ) : (
        <div className="grid gap-3">
          {scheduled.map((match) => (
            <Link href={`/app/matches/${match.id}`} key={match.id}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary-strong">
                    <CalendarDays size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black">{t("scheduled")}</p>
                    <p className="mt-1 text-sm font-semibold text-muted">{formatDateTime(match.playedAt, locale, { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <MatchStatusChip status={match.status} />
                </div>
              </Card>
            </Link>
          ))}
          {pendingInvites.map((invite) => (
            <Link href="/app/invites" key={invite.id}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-marker-soft text-warning">
                    <MailPlus size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black">Convite pendente</p>
                    <p className="mt-1 text-sm font-semibold text-muted">{invite.email}</p>
                  </div>
                  <Bell className="text-muted" size={18} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
