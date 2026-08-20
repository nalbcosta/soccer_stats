import type { DashboardResponse } from "../api";

export interface DashboardMetric {
  key: "teams" | "matches" | "tournaments";
  label: string;
  value: number;
  helper: string;
}

export function buildDashboardMetrics(dashboard: DashboardResponse): DashboardMetric[] {
  const activeMatches = dashboard.matches.filter((match) => match.status === "scheduled" || match.status === "confirming").length;

  return [
    {
      key: "teams",
      label: "Times",
      value: dashboard.teams.length,
      helper: "Elencos ativos"
    },
    {
      key: "matches",
      label: "Agenda",
      value: activeMatches,
      helper: "Jogos no radar"
    },
    {
      key: "tournaments",
      label: "Copas",
      value: dashboard.tournaments.length,
      helper: "Ligas da turma"
    }
  ];
}
