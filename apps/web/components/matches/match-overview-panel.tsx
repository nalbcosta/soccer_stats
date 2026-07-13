import { CalendarDays, MapPin, Trophy } from "lucide-react";
import type { Match } from "@soccer-stats/shared";
import { ScoreboardCard } from "../sports/scoreboard-card";
import { Card } from "../ui/card";
import { useLocale, useTranslations } from "../../i18n/provider";
import { formatDateTime } from "../../i18n/formatters";

export function MatchOverviewPanel({
  awayName,
  homeName,
  match,
  tournament,
  venueLabel
}: {
  awayName: string;
  homeName: string;
  match: Match;
  tournament?: { name: string };
  venueLabel: string;
}) {
  const { locale } = useLocale();
  const t = useTranslations("match");

  return (
    <div className="grid gap-4">
      <ScoreboardCard
        awayName={awayName}
        awayScore={match.away.score}
        homeName={homeName}
        homeScore={match.home.score}
        match={match}
        status={match.status}
      />
      <Card className="p-4">
        <p className="text-xs font-black uppercase text-muted">{t("details")}</p>
        <div className="mt-3 grid gap-2">
          <InfoRow icon={CalendarDays} label={t("date")} value={formatDateTime(match.playedAt, locale, { dateStyle: "medium", timeStyle: "short" })} />
          <InfoRow icon={MapPin} label={t("venue")} value={venueLabel} />
          <InfoRow icon={Trophy} label={t("competition")} value={tournament?.name ?? t("casual")} />
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-canvas p-3">
      <Icon className="text-primary-strong" size={17} />
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase text-muted">{label}</p>
        <p className="truncate text-sm font-black">{value}</p>
      </div>
    </div>
  );
}
