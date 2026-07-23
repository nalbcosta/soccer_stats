"use client";

import Link from "next/link";
import { CalendarDays, Medal } from "lucide-react";
import { Card } from "../ui/card";
import { TeamCrest } from "../ui/team-crest";
import { MatchStatusChip } from "../sports/match-status-chip";
import { useSession } from "./session-provider";
import { useLocale, useTranslations } from "../../i18n/provider";
import { formatDateTime, formatTime } from "../../i18n/formatters";

export function ContextRail() {
  const { dashboard } = useSession();
  const { locale } = useLocale();
  const t = useTranslations("match");

  if (!dashboard) {
    return null;
  }

  const nextMatch = dashboard.matches
    .filter((match) => match.status === "scheduled")
    .sort((left, right) => new Date(left.playedAt).getTime() - new Date(right.playedAt).getTime())[0];
  const topTeams = [...dashboard.teams].sort((left, right) => right.stats.points - left.stats.points).slice(0, 3);

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 grid gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-primary-strong" size={18} />
            <p className="text-xs font-black uppercase text-muted">{t("next")}</p>
          </div>
          {nextMatch ? (
            <Link className="mt-4 block rounded-lg bg-canvas p-3" href={`/app/matches/${nextMatch.id}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black">{formatDateTime(nextMatch.playedAt, locale, { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                <MatchStatusChip status={nextMatch.status} />
              </div>
              <p className="mt-2 text-xs font-semibold text-muted">{formatTime(nextMatch.playedAt, locale)}</p>
            </Link>
          ) : (
            <p className="mt-4 text-sm font-semibold text-muted">Sem jogo marcado agora.</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Medal className="text-primary-strong" size={18} />
            <p className="text-xs font-black uppercase text-muted">Top ranking</p>
          </div>
          <div className="mt-4 grid gap-3">
            {topTeams.length === 0 ? (
              <p className="text-sm font-semibold text-muted">O ranking aparece quando os times pontuam.</p>
            ) : (
              topTeams.map((team, index) => (
                <Link className="flex items-center gap-3 rounded-lg bg-canvas p-2" href={`/app/teams/${team.id}`} key={team.id}>
                  <span className="w-5 text-center text-sm font-black text-muted">{index + 1}</span>
                  <TeamCrest className="h-8 w-8 text-xs" name={team.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{team.name}</p>
                    <p className="text-xs font-semibold text-muted">{team.stats.points} pts</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </aside>
  );
}
