import type { PlayerCardV2, PlayerInsight, PlayerRankingEntry, PublicUser } from "@soccer-stats/shared";
import type { DashboardResponse } from "../api";
import { buildDashboardMetrics, type DashboardMetric } from "./dashboard-metrics";
import { toMatchSummary, selectNextMatch, type DashboardMatchSummary } from "./dashboard-match-selectors";
import { buildDashboardActions, selectUnreadNotifications, type DashboardActionItem } from "./dashboard-notification-selectors";
import { alignOwnRankingWithCard, selectPlayerRankingPreview, selectTeamRankingPreview, type DashboardTeamRankingItem } from "./dashboard-ranking-selectors";

export interface DashboardHomeViewModel {
  metrics: DashboardMetric[];
  nextMatch: DashboardMatchSummary | null;
  actions: DashboardActionItem[];
  playerRanking: PlayerRankingEntry[];
  teamRanking: DashboardTeamRankingItem[];
  unreadNotifications: DashboardResponse["notifications"];
  venues: DashboardResponse["venues"];
  card: PlayerCardV2 | null;
  insights: PlayerInsight[];
  hasTeams: boolean;
  hasMatches: boolean;
  showActionQueue: boolean;
  showNotifications: boolean;
  showVenues: boolean;
}

export function buildDashboardViewModel({
  card,
  dashboard,
  insights,
  playerRanking,
  user
}: {
  card: PlayerCardV2 | null;
  dashboard: DashboardResponse;
  insights: PlayerInsight[];
  playerRanking: PlayerRankingEntry[];
  user: PublicUser;
}): DashboardHomeViewModel {
  const nextMatch = selectNextMatch(dashboard.matches);
  const actions = buildDashboardActions({
    invites: dashboard.invites,
    matches: dashboard.matches,
    notifications: dashboard.notifications,
    userId: user.id
  });
  const unreadNotifications = selectUnreadNotifications(dashboard.notifications);

  return {
    metrics: buildDashboardMetrics(dashboard),
    nextMatch: toMatchSummary(nextMatch, dashboard.teams, dashboard.tournaments),
    actions,
    playerRanking: selectPlayerRankingPreview(alignOwnRankingWithCard(playerRanking, card)),
    teamRanking: selectTeamRankingPreview(dashboard.teams),
    unreadNotifications,
    venues: dashboard.venues.slice(0, 4),
    card,
    insights,
    hasTeams: dashboard.teams.length > 0,
    hasMatches: dashboard.matches.length > 0,
    showActionQueue: actions.some((action) => action.key !== "create-match"),
    showNotifications: unreadNotifications.length > 0,
    showVenues: dashboard.venues.length > 0
  };
}
