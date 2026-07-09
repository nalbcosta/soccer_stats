import type { PlayerCardV2, PlayerInsight, PlayerProfile, PublicUser } from "@soccer-stats/shared";
import { Activity, Sparkles } from "lucide-react";
import { PlayerCard } from "../sports/player-card";
import { Card } from "../ui/card";

export function DashboardPlayerCardPanel({
  card,
  insights,
  profile,
  user
}: {
  card: PlayerCardV2 | null;
  insights: PlayerInsight[];
  profile: PlayerProfile | null;
  user: PublicUser;
}) {
  if (!card) {
    return <PlayerCard profile={profile} user={user} />;
  }

  const topFactors = card.factors.slice(0, 4);
  const topInsight = insights[0];

  return (
    <Card className="overflow-hidden">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#08716d_0%,#00a8a3_48%,#2f8f46_100%)] p-4 text-white sm:p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.32)_1px,transparent_1px)] [background-size:28px_28px]"
        />
        <div className="relative">
          <p className="text-xs font-black uppercase text-white/78">NaBola Card v2</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-5xl font-black leading-none tabular-nums sm:text-6xl">{card.score}</p>
              <p className="mt-1 text-sm font-black uppercase text-white/82">Overall explicável</p>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white/16 text-white">
              <Sparkles size={22} />
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold leading-relaxed text-white/88">{card.explanation}</p>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {topFactors.map((factor) => (
            <div className="min-w-[8.5rem] flex-1 rounded-lg bg-canvas p-3" key={factor.key}>
              <p className="text-[11px] font-black uppercase leading-tight text-muted">{factor.label}</p>
              <p className="mt-1 text-2xl font-black tabular-nums">{factor.value}</p>
            </div>
          ))}
        </div>

        {topInsight ? (
          <div className="rounded-lg border border-border bg-surface p-3 shadow-line">
            <div className="flex items-center gap-2 text-primary-strong">
              <Activity size={16} />
              <p className="text-xs font-black uppercase text-muted">{topInsight.title}</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-muted">{topInsight.message}</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
