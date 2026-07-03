import type { LucideIcon } from "lucide-react";
import { BarChart3, Bell, CalendarDays, Home, MailPlus, Medal, Trophy, Users } from "lucide-react";

export type AppRoute = "/app" | "/app/matches" | "/app/teams" | "/app/ranking";
export type SecondaryAppRoute = "/app/tournaments" | "/app/stats" | "/app/invites" | "/app/notifications";

export interface NavItem {
  href: AppRoute | SecondaryAppRoute;
  label: string;
  icon: LucideIcon;
}

export const appNavItems: NavItem[] = [
  { href: "/app", label: "Resumo", icon: Home },
  { href: "/app/matches", label: "Jogos", icon: CalendarDays },
  { href: "/app/teams", label: "Times", icon: Users },
  { href: "/app/ranking", label: "Ranking", icon: Medal }
];

export const secondaryNavItems: NavItem[] = [
  { href: "/app/tournaments", label: "Copas", icon: Trophy },
  { href: "/app/stats", label: "Stats", icon: BarChart3 },
  { href: "/app/invites", label: "Convites", icon: MailPlus },
  { href: "/app/notifications", label: "Avisos", icon: Bell }
];
