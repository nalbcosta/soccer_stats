"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useNotificationFeed } from "../../composables/use-notification-feed";
import { PageHeading } from "../app/page-heading";
import { EmptyState } from "../feedback/empty-state";
import { LoadingState } from "../feedback/loading-state";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useSession } from "../app/session-provider";

export function NotificationsPageContent() {
  const { dashboard } = useSession();
  const { markAllRead, markRead, markingAllRead, notifications, text, unreadCount } = useNotificationFeed();

  if (!dashboard) {
    return <LoadingState label={text("notificationsLoading")} />;
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeading eyebrow={text("alerts")} title={text("notificationsTitle")} />
        {unreadCount > 0 ? (
          <Button disabled={markingAllRead} type="button" variant="secondary" onClick={() => void markAllRead()}>
            <CheckCheck size={17} />
            {text("readAll")}
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title={text("notificationsEmpty")} description={text("notificationsDescription")} />
      ) : (
        <div className="grid gap-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            const unread = !notification.readAt;

            return (
              <Link href={notification.href} key={notification.id} onClick={() => void markRead(notification.id)}>
                <Card className={`p-4 transition hover:-translate-y-0.5 ${unread ? "border-primary/30 bg-primary-soft/30" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-strong">
                      <Icon size={19} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black">{notification.title}</p>
                        {unread ? <Badge className="min-h-5 rounded-full px-2 text-[10px]" tone="primary">{text("new")}</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-muted">{notification.message}</p>
                      <p className="mt-2 text-xs font-semibold text-muted">{notification.timeLabel}</p>
                    </div>
                    <Bell className={unread ? "text-primary-strong" : "text-muted"} size={18} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
