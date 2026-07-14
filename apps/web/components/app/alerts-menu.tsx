"use client";

import Link from "next/link";
import { Bell, CheckCheck, X } from "lucide-react";
import { useAlertsMenu } from "../../composables/use-alerts-menu";
import { useTranslations } from "../../i18n/provider";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MenuShell } from "./menu-shell";

type AlertsMenuMode = "header" | "mobile";

export function AlertsMenu({ mode }: { mode: AlertsMenuMode }) {
  const { buttonRef, handleMarkAllRead, items, markingRead, open, setOpen, text, unreadCount } = useAlertsMenu();
  const commonText = useTranslations("common");

  return (
    <>
      <Button
        ref={buttonRef}
        className={
          mode === "header"
            ? "relative min-h-10 rounded-xl px-0 md:w-auto md:gap-2 md:px-3.5"
            : "relative flex h-full min-h-touch w-full flex-col items-center justify-center gap-1 rounded-none border-0 bg-transparent px-0 text-[11px] font-black text-muted shadow-none hover:bg-transparent"
        }
        type="button"
        variant={mode === "header" ? "secondary" : "ghost"}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${text("alerts")}${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
      >
        <Bell size={16} strokeWidth={2.3} />
        <span className={mode === "header" ? "sr-only md:not-sr-only" : ""}>{text("alerts")}</span>
        {unreadCount > 0 ? (
            <Badge className="absolute -right-2 -top-2 min-h-5 min-w-5 rounded-full px-1.5 text-[10px] ring-2 ring-canvas" tone="warning">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        ) : null}
      </Button>

      <MenuShell anchorRef={buttonRef} mobileFullScreen onClose={() => setOpen(false)} open={open}>
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-muted">{text("alerts")}</p>
              <p className="mt-1 text-sm font-semibold text-muted">{text("alertsDescription")}</p>
            </div>
            <Button className="min-h-9 px-2" type="button" variant="ghost" onClick={() => setOpen(false)} title={commonText("close")}>
              <X size={18} />
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Link
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text hover:bg-canvas"
              href="/app/notifications"
              onClick={() => setOpen(false)}
            >
              <Bell size={16} />
              {text("viewAll")}
            </Link>
            <Button
              className="min-h-9 px-3 text-sm font-semibold"
              disabled={unreadCount === 0 || markingRead}
              type="button"
              variant="secondary"
              onClick={() => void handleMarkAllRead()}
            >
              <CheckCheck size={16} />
              {text("readAll")}
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {items.length === 0 ? (
            <div className="rounded-lg bg-canvas p-4 text-sm font-semibold text-muted">{text("notificationsEmpty")}</div>
          ) : (
            <div className="grid gap-2">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    className="flex min-h-12 items-start gap-3 rounded-lg px-3 py-3 hover:bg-canvas"
                    href={item.href}
                    key={item.id}
                    onClick={() => setOpen(false)}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black">{item.title}</p>
                      <p className="mt-1 text-sm font-semibold text-muted">{item.message}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </MenuShell>
    </>
  );
}
