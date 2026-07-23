"use client";

import { useRef, useState } from "react";
import { useNotificationFeed } from "./use-notification-feed";

export function useAlertsMenu() {
  const { markAllRead, markingAllRead, notifications, text, unreadCount } = useNotificationFeed({ limit: 4, unreadOnly: true });
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return {
    buttonRef,
    handleMarkAllRead: markAllRead,
    items: notifications,
    markingRead: markingAllRead,
    open,
    setOpen,
    text,
    unreadCount
  };
}
