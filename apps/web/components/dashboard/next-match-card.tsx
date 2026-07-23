"use client";

import Link from "next/link";
import type { DashboardResponse } from "../../lib/api";
import { ScoreboardCard } from "../sports/scoreboard-card";
import { Card } from "../ui/card";
import { useLocale, useTranslations } from "../../i18n/provider";
import { formatDateTime } from "../../i18n/formatters";

export function NextMatchCard({ dashboard }: { dashboard: DashboardResponse }) {
  const { locale } = useLocale();
  const t = useTranslations("match");
  const nextMatch = dashboard.matches
    .filter((match) => match.status === "scheduled")
    .sort((left, right) => new Date(left.playedAt).getTime() - new Date(right.playedAt).getTime())[0];

  if (!nextMatch) {
    return (
      <Card className="p-4">
        <p className="text-xs font-bold uppercase text-muted">Agenda</p>
        <p className="mt-2 font-extrabold">{t("noScheduled")}</p>
        <Link className="mt-3 inline-flex text-sm font-bold text-primary-strong" href="/app/matches">
          Marcar jogo
        </Link>
      </Card>
    );
  }

  const home = dashboard.teams.find((team) => team.id === nextMatch.home.teamId)?.name ?? "Casa";
  const away = dashboard.teams.find((team) => team.id === nextMatch.away.teamId)?.name ?? "Fora";

  return (
    <Link href={`/app/matches/${nextMatch.id}`}>
      <ScoreboardCard
        awayName={away}
        awayScore={nextMatch.away.score}
        eyebrow={t("next")}
        homeName={home}
        homeScore={nextMatch.home.score}
        meta={formatDateTime(nextMatch.playedAt, locale, { dateStyle: "medium", timeStyle: "short" })}
        status={nextMatch.status}
      />
    </Link>
  );
}
