"use client";

import { useCallback, useMemo, useState } from "react";
import { formatDateTime } from "../i18n/formatters";
import { useLocale, useTranslations } from "../i18n/provider";
import { getNotificationPresentation } from "../lib/notifications/notification-presentation";
import { useSession } from "../components/app/session-provider";

export function useNotificationFeed({ limit, unreadOnly = false }: { limit?: number; unreadOnly?: boolean } = {}) {
  const { dashboard, markAllNotificationsRead, markNotificationRead, setFeedback } = useSession();
  const { locale } = useLocale();
  const text = useTranslations("dashboard");
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markingReadIds, setMarkingReadIds] = useState<string[]>([]);

  const unreadCount = dashboard?.notifications.filter((notification) => !notification.readAt).length ?? 0;
  const notifications = useMemo(() => {
    const source = dashboard?.notifications ?? [];
    const filtered = unreadOnly ? source.filter((notification) => !notification.readAt) : source;
    const limited = limit === undefined ? filtered : filtered.slice(0, limit);

    return limited.map((notification) => ({
      ...notification,
      ...getNotificationPresentation(notification, text),
      timeLabel: formatDateTime(notification.createdAt, locale, { dateStyle: "medium", timeStyle: "short" })
    }));
  }, [dashboard, limit, locale, text, unreadOnly]);

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0 || markingAllRead) {
      return;
    }

    setMarkingAllRead(true);

    try {
      await markAllNotificationsRead();
      setFeedback(text("notificationsMarkedRead"));
    } catch {
      setFeedback(text("notificationsMarkReadError"), "error");
    } finally {
      setMarkingAllRead(false);
    }
  }, [markAllNotificationsRead, markingAllRead, setFeedback, text, unreadCount]);

  const markRead = useCallback(async (notificationId: string) => {
    if (markingReadIds.includes(notificationId)) {
      return;
    }

    setMarkingReadIds((current) => [...current, notificationId]);

    try {
      await markNotificationRead(notificationId);
    } catch {
      setFeedback(text("notificationMarkReadError"), "error");
    } finally {
      setMarkingReadIds((current) => current.filter((id) => id !== notificationId));
    }
  }, [markNotificationRead, markingReadIds, setFeedback, text]);

  return {
    markAllRead,
    markRead,
    markingAllRead,
    markingReadIds,
    notifications,
    text,
    unreadCount
  };
}
