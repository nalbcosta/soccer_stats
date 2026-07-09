"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, CheckCheck, MailPlus, X } from "lucide-react";
import { useSession } from "./session-provider";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MenuShell } from "./menu-shell";

type AlertsMenuMode = "header" | "mobile";

export function AlertsMenu({ mode }: { mode: AlertsMenuMode }) {
  const { dashboard } = useSession();
  const [open, setOpen] = useState(false);
  const [cleared, setCleared] = useState(false);

  const items = useMemo(() => {
    const unreadNotifications = dashboard?.notifications?.filter((notification) => !notification.readAt).slice(0, 4) ?? [];
    const scheduled = dashboard?.matches.filter((match) => match.status === "scheduled").slice(0, 4) ?? [];
    const pendingInvites = dashboard?.invites.filter((invite) => invite.status === "pending").slice(0, 4) ?? [];

    return [
      ...unreadNotifications.map((notification) => ({
        href: "/app/notifications",
        icon: Bell,
        label: notification.title,
        meta: notification.message
      })),
      ...scheduled.map((match) => ({
        href: `/app/matches/${match.id}`,
        icon: CalendarDays,
        label: "Jogo marcado",
        meta: new Date(match.playedAt).toLocaleString("pt-BR")
      })),
      ...pendingInvites.map((invite) => ({
        href: "/app/invites",
        icon: MailPlus,
        label: "Convite pendente",
        meta: invite.email
      }))
    ];
  }, [dashboard]);

  useEffect(() => {
    if (!open) {
      setCleared(false);
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visibleItems = cleared ? [] : items;
  const unreadCount = cleared ? 0 : dashboard?.notifications?.filter((notification) => !notification.readAt).length ?? 0;

  return (
    <>
      <Button
        className={
          mode === "header"
            ? "relative h-10 min-h-10 w-10 rounded-xl px-0 md:w-auto md:gap-2 md:px-3.5"
            : "relative flex h-full min-h-touch w-full flex-col items-center justify-center gap-1 rounded-none border-0 bg-transparent px-0 text-[11px] font-black text-muted shadow-none hover:bg-transparent"
        }
        type="button"
        variant={mode === "header" ? "secondary" : "ghost"}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell size={mode === "header" ? 20 : 20} strokeWidth={2.3} />
        <span className={mode === "header" ? "sr-only md:not-sr-only" : ""}>Avisos</span>
        {unreadCount > 0 ? (
          <Badge className="absolute -right-1 -top-1 min-h-5 min-w-5 px-1.5 text-[10px]" tone="warning">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        ) : null}
      </Button>

      <MenuShell mobileFullScreen onClose={() => setOpen(false)} open={open}>
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-muted">Avisos</p>
              <p className="mt-1 text-sm font-semibold text-muted">Jogo marcado, convite pendente e novidades da rodada.</p>
            </div>
            <Button className="min-h-9 px-2" type="button" variant="ghost" onClick={() => setOpen(false)} title="Fechar">
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
              Ver tudo
            </Link>
            <Button
              className="min-h-9 px-3 text-sm font-semibold"
              type="button"
              variant="secondary"
              onClick={() => setCleared(true)}
            >
              <CheckCheck size={16} />
              Limpar
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {visibleItems.length === 0 ? (
            <div className="rounded-lg bg-canvas p-4 text-sm font-semibold text-muted">Tudo quieto por aqui.</div>
          ) : (
            <div className="grid gap-2">
              {visibleItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    className="flex min-h-12 items-start gap-3 rounded-lg px-3 py-3 hover:bg-canvas"
                    href={item.href}
                    key={`${item.href}-${item.label}-${item.meta}`}
                    onClick={() => setOpen(false)}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-muted">{item.meta}</p>
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
