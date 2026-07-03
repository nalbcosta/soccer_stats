import clsx from "clsx";
import type { AggregatedStats, PlayerProfile, PublicUser } from "@soccer-stats/shared";
import { buildPlayerCardRatings, createEmptyStats } from "@soccer-stats/shared";
import type { LucideIcon } from "lucide-react";
import { Award, Footprints, Shield } from "lucide-react";
import { FormDots } from "./form-dots";

type PlayerCardSize = "compact" | "full";

const positionLabel: Record<PlayerProfile["preferredPosition"], string> = {
  goalkeeper: "GOL",
  defender: "DEF",
  midfielder: "MEI",
  forward: "ATA"
};

const footLabel: Record<PlayerProfile["preferredFoot"], string> = {
  right: "Direita",
  left: "Esquerda",
  both: "Ambas"
};

const rarityStyles = {
  base: "from-primary to-field",
  rising: "from-field to-primary",
  star: "from-primary to-warning",
  legend: "from-text to-primary"
};

function getRarity(overall: number, matchesPlayed: number): keyof typeof rarityStyles {
  if (overall >= 88 && matchesPlayed >= 20) {
    return "legend";
  }

  if (overall >= 78) {
    return "star";
  }

  if (overall >= 66 || matchesPlayed >= 5) {
    return "rising";
  }

  return "base";
}

export function PlayerCard({
  profile,
  user,
  size = "compact",
  className
}: {
  profile: PlayerProfile | null;
  user: PublicUser;
  size?: PlayerCardSize;
  className?: string;
}) {
  const displayName = profile?.displayName ?? user.username;
  const stats: AggregatedStats = profile?.stats ?? createEmptyStats();
  const ratings = buildPlayerCardRatings(stats);
  const rarity = getRarity(ratings.overall, stats.matchesPlayed);
  const position = profile ? positionLabel[profile.preferredPosition] : "PEL";
  const preferredFoot = profile ? footLabel[profile.preferredFoot] : "Definir";
  const isFull = size === "full";

  return (
    <article
      className={clsx(
        "overflow-hidden rounded-lg border border-border bg-surface shadow-line",
        isFull ? "max-w-xl lg:max-w-none" : "w-full",
        className
      )}
    >
      <div className={clsx("field-grid bg-gradient-to-br p-4 text-white", rarityStyles[rarity])}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase opacity-80">NaBola Card</p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-5xl font-black leading-none tabular-nums">{ratings.overall}</p>
              <div className="pb-1">
                <p className="text-sm font-black">{position}</p>
                <p className="text-[11px] font-black uppercase opacity-75">Geral</p>
              </div>
            </div>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-white/16 text-2xl font-black shadow-line">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="mt-6">
          <p className="truncate text-2xl font-black leading-tight">{displayName}</p>
          <p className="text-sm font-bold opacity-80">@{user.username}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <InfoPill icon={Footprints} label={`Perna ${preferredFoot}`} />
          <InfoPill icon={Shield} label={`${stats.wins} vitorias`} />
          <InfoPill icon={Award} label={`${stats.matchesPlayed} jogos`} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Rating label="ATA" value={ratings.attack} />
          <Rating label="PAS" value={ratings.pass} />
          <Rating label="PRE" value={ratings.presence} />
          <Rating label="REG" value={ratings.regularity} />
          <Rating label="VIT" value={ratings.winning} />
          <Rating label="FAS" value={ratings.form} />
        </div>

        {isFull ? (
          <div className="mt-4 grid gap-3 rounded-lg bg-canvas p-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-xs font-black uppercase text-muted">Momento</p>
              <p className="mt-1 text-sm font-semibold text-muted">{stats.recentHighlight}</p>
            </div>
            <FormDots form={stats.form} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Rating({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-canvas p-2 text-center">
      <p className="text-lg font-black tabular-nums">{value}</p>
      <p className="text-[11px] font-black uppercase text-muted">{label}</p>
    </div>
  );
}

function InfoPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-canvas px-2.5 text-xs font-black text-muted">
      <Icon size={14} />
      {label}
    </span>
  );
}
