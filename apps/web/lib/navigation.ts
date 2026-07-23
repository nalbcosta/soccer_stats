export function resolveAppBackFallback(pathname: string): string {
  if (pathname.startsWith("/app/matches/")) {
    return "/app/matches";
  }

  if (pathname.startsWith("/app/teams/")) {
    return "/app/teams";
  }

  if (pathname.startsWith("/app/tournaments/")) {
    return "/app/tournaments";
  }

  return "/app";
}

export function canUseRouterBack(historyState: unknown): boolean {
  if (!historyState || typeof historyState !== "object") {
    return false;
  }

  const state = historyState as { idx?: unknown };
  return typeof state.idx === "number" && state.idx > 0;
}
