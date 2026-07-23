import type { LucideIcon } from "lucide-react";
import { BarChart3, Bell, CalendarDays, Home, MailPlus, Medal, Trophy, Users } from "lucide-react";

export type AppRoute = "/app" | "/app/matches" | "/app/teams" | "/app/ranking";
export type SecondaryAppRoute = "/app/tournaments" | "/app/stats" | "/app/invites" | "/app/notifications";

export interface NavItem {
  href: AppRoute | SecondaryAppRoute;
  labelKey: string;
  icon: LucideIcon;
}

export const appNavItems: NavItem[] = [
  { href: "/app", labelKey: "home", icon: Home },
  { href: "/app/matches", labelKey: "matches", icon: CalendarDays },
  { href: "/app/teams", labelKey: "teams", icon: Users },
  { href: "/app/ranking", labelKey: "ranking", icon: Medal }
];

export const secondaryNavItems: NavItem[] = [
  { href: "/app/tournaments", labelKey: "tournaments", icon: Trophy },
  { href: "/app/stats", labelKey: "stats", icon: BarChart3 },
  { href: "/app/invites", labelKey: "invites", icon: MailPlus },
  { href: "/app/notifications", labelKey: "notifications", icon: Bell }
];
