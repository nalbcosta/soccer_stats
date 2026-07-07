"use client";

import clsx from "clsx";
import type { AggregatedStats, PlayerProfile, PublicUser } from "@soccer-stats/shared";
import { buildPlayerCardRatings, createEmptyStats } from "@soccer-stats/shared";
import type { LucideIcon } from "lucide-react";
import { Award, Footprints, Shirt, Shield, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { resolveApiAssetUrl } from "../../lib/api";
import { FormDots } from "./form-dots";
import { AnimatedFieldGrid } from "../public/animated-field-grid";
import { LazyImage } from "../ui/lazy-image";

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

const positionAccentClass: Record<PlayerProfile["preferredPosition"], string> = {
  goalkeeper: "bg-[#f2c94c]/24 text-[#ffe08a]",
  defender: "bg-[#70b8ff]/22 text-[#d8ecff]",
  midfielder: "bg-[#25c7bd]/22 text-[#d9fffb]",
  forward: "bg-[#57c86b]/22 text-[#ddffe3]"
};

const rarityStyles = {
  base: "from-primary to-field",
  rising: "from-field to-primary",
  star: "from-primary to-warning",
  legend: "from-text to-primary"
};

function formatShirtNumber(shirtNumber?: number) {
  return shirtNumber ? `#${String(shirtNumber).padStart(2, "0")}` : "#--";
}

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
  const stats: AggregatedStats = profile?.stats ?? createEmptyStats();
  const ratings = buildPlayerCardRatings(stats);
  const rarity = getRarity(ratings.overall, stats.matchesPlayed);
  const preferredPosition = profile?.preferredPosition ?? "forward";
  const position = profile ? positionLabel[profile.preferredPosition] : "PEL";
  const preferredFoot = profile ? footLabel[profile.preferredFoot] : "Definir";
  const isFull = size === "full";
  const isGoalkeeper = profile?.preferredPosition === "goalkeeper";
  const shirtNumberLabel = formatShirtNumber(profile?.shirtNumber);
  const [photoStatus, setPhotoStatus] = useState<"idle" | "loading" | "loaded" | "error">(profile?.photoUrl ? "idle" : "error");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPhotoStatus(profile?.photoUrl ? "idle" : "error");
  }, [profile?.photoUrl]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedPhotoUrl = profile?.photoUrl ? resolveApiAssetUrl(profile.photoUrl) : null;
  const hasPhoto = Boolean(resolvedPhotoUrl) && photoStatus !== "error";
  const isPhotoLoaded = photoStatus === "loaded";

  const isDarkMode = mounted ? resolvedTheme === "dark" : false;
  const shellTextClass = isDarkMode ? "text-white" : "text-text";
  const shellMutedClass = isDarkMode ? "text-white/78" : "text-text-muted";
  const shellBorderClass = isDarkMode ? "border-white/12" : "border-border";
  const shellSoftClass = isDarkMode ? "bg-white/10" : "bg-canvas";
  const positionBadgeClass = hasPhoto
    ? "border-white/16 bg-black/28 text-white shadow-[0_12px_26px_rgba(0,0,0,0.28)] backdrop-blur-md"
    : isDarkMode
    ? "border-white/18 bg-white/12 text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] backdrop-blur-sm"
    : "border-border bg-white/72 text-text shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-sm";
  const numberBadgeClass = hasPhoto
    ? isDarkMode
      ? "border-white/16 bg-white/12 text-white shadow-[0_14px_28px_rgba(0,0,0,0.24)] backdrop-blur-md"
      : "border-white/65 bg-white/94 text-text shadow-[0_14px_28px_rgba(0,0,0,0.18)] backdrop-blur-md"
    : isDarkMode
      ? "border-white/15 bg-white/12 text-white"
      : "border-border bg-surface/90 text-text";
  const topOverlayClass = hasPhoto
    ? isDarkMode
      ? "bg-[linear-gradient(90deg,rgba(7,18,15,0.92)_0%,rgba(7,18,15,0.72)_34%,rgba(7,18,15,0.24)_62%,rgba(7,18,15,0.5)_100%)]"
      : "bg-[linear-gradient(90deg,rgba(16,36,33,0.46)_0%,rgba(16,36,33,0.4)_22%,rgba(16,36,33,0.14)_56%,rgba(16,36,33,0.38)_100%)]"
    : "";
  const topVignetteClass = hasPhoto
    ? isDarkMode
      ? "bg-[linear-gradient(180deg,rgba(7,18,15,0)_52%,rgba(7,18,15,0.58)_78%,rgba(7,18,15,0.9)_100%)]"
      : "bg-[linear-gradient(180deg,rgba(16,36,33,0)_48%,rgba(16,36,33,0.28)_76%,rgba(16,36,33,0.52)_100%)]"
    : "";
  const topTextClass = hasPhoto
    ? isDarkMode
      ? "text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.4)]"
      : "text-[#fffdf8] [text-shadow:0_2px_14px_rgba(0,0,0,0.34)]"
    : shellTextClass;
  const topMutedClass = hasPhoto ? (isDarkMode ? "text-white/80" : "text-white/88") : shellMutedClass;
  const playerNameClass = hasPhoto ? (isDarkMode ? "text-white" : "text-[#fffaf2]") : shellTextClass;
  const usernameClass = hasPhoto ? (isDarkMode ? "text-white/82" : "text-white/90") : shellMutedClass;
  const teamNameClass = hasPhoto ? (isDarkMode ? "text-white/74" : "text-white/84") : shellMutedClass;
  const positionAccent = positionAccentClass[preferredPosition];

  return (
    <article
      className={clsx(
        "overflow-hidden rounded-lg border border-border bg-surface shadow-line",
        isFull ? "max-w-xl lg:max-w-none" : "w-full",
        className
      )}
    >
      <div
        className={clsx(
          "relative overflow-hidden p-3 sm:p-4",
          hasPhoto
            ? "min-h-[18rem] bg-cover bg-[center_22%] bg-no-repeat sm:min-h-56 sm:bg-[center_18%]"
            : clsx("field-grid bg-gradient-to-br", rarityStyles[rarity]),
          topTextClass
        )}
        style={hasPhoto && resolvedPhotoUrl ? { backgroundImage: `url("${resolvedPhotoUrl}")` } : undefined}
      >
        {resolvedPhotoUrl ? (
          <LazyImage
            alt={profile?.displayName ?? user.username}
            className="absolute inset-0"
            imageClassName="h-full w-full object-cover"
            loadingClassName="bg-transparent"
            objectPosition="center 22%"
            onStatusChange={setPhotoStatus}
            src={resolvedPhotoUrl}
          />
        ) : null}
        {hasPhoto ? <div aria-hidden="true" className={clsx("absolute inset-0", topOverlayClass)} /> : null}
        {hasPhoto && isPhotoLoaded ? <div aria-hidden="true" className={clsx("absolute inset-x-0 bottom-0 h-28", topVignetteClass)} /> : null}
        <div className="relative">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className={clsx("text-xs font-black uppercase tracking-[0.12em]", topMutedClass)}>NaBola Card</p>
              <div className="mt-3">
                <div
                  className={clsx(
                    "inline-flex items-end gap-3 rounded-[1.25rem] border px-3 py-3 shadow-line backdrop-blur-md sm:rounded-[1.5rem] sm:px-4",
                    hasPhoto
                      ? isDarkMode
                        ? "border-white/14 bg-black/20"
                        : "border-white/18 bg-black/14"
                      : isDarkMode
                        ? "border-white/12 bg-white/8"
                        : "border-border bg-white/68"
                  )}
                >
                  <div>
                    <p className={clsx("text-[11px] font-black uppercase tracking-[0.18em]", topMutedClass)}>Overall</p>
                    <p className={clsx("mt-1 text-5xl font-black leading-none tabular-nums sm:text-6xl", hasPhoto && "text-white")}>{ratings.overall}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={clsx("min-w-20 shrink-0 rounded-[1.1rem] border px-2.5 py-2 shadow-line sm:min-w-24 sm:rounded-[1.25rem] sm:px-3", numberBadgeClass)}>
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    "grid h-9 w-9 place-items-center rounded-full sm:h-10 sm:w-10",
                    hasPhoto ? (isDarkMode ? "bg-white/10 text-text" : "bg-text/80 text-white") : "bg-current/10"
                  )}
                >
                  <Shirt size={15} />
                </span>
                <div className="min-w-0">
                  <p
                    className={clsx(
                      "text-[11px] font-black uppercase tracking-[0.18em]",
                      hasPhoto ? (isDarkMode ? "text-white/76" : "text-white") : topMutedClass
                    )}
                  >
                    Camisa
                  </p>
                  <p className={clsx("text-base font-black leading-none tabular-nums sm:text-lg", hasPhoto && !isDarkMode && "text-[#102421]")}>
                    {shirtNumberLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0 sm:max-w-[66%]">
              {profile?.teamName ? (
                <p className={clsx("truncate text-xs font-black uppercase tracking-[0.18em]", teamNameClass)}>
                  {profile.teamName}
                </p>
              ) : null}
              <p className={clsx("truncate text-[1.55rem] font-black uppercase leading-none tracking-[0.02em] sm:text-[1.75rem]", playerNameClass)}>
                {profile?.displayName ?? user.username}
              </p>
              <p className={clsx("mt-1.5 text-sm font-bold sm:mt-2 sm:text-base", usernameClass)}>@{user.username}</p>
            </div>
            <div className={clsx("inline-flex w-fit items-center gap-2 self-start rounded-full border px-3 py-2 sm:self-auto", positionBadgeClass)}>
              <span className={clsx("grid h-9 w-9 place-items-center rounded-full text-xs font-black", positionAccent)}>
                {position}
              </span>
              <div className="min-w-0">
                <p className={clsx("text-[11px] font-black uppercase tracking-[0.18em]", topMutedClass)}>Posição</p>
                <p className={clsx("text-sm font-black leading-none", hasPhoto ? (isDarkMode ? "text-white" : "text-[#fffdf8]") : "")}>
                  {getPositionTitle(preferredPosition)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={clsx("relative space-y-4 p-4", hasPhoto && "overflow-hidden")}>
        {hasPhoto ? <AnimatedFieldGrid className="opacity-75" glowClassName={isDarkMode ? "opacity-80" : "opacity-70"} /> : null}
        <div className="relative space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <InfoPill icon={Footprints} label={`Perna ${preferredFoot}`} />
              <InfoPill icon={Award} label={`${stats.matchesPlayed} jogos`} />
              <InfoPill
                icon={isGoalkeeper ? Shield : Sparkles}
                label={isGoalkeeper ? `${stats.saves} defesas` : `${stats.cleanSheets} clean sheets`}
              />
            </div>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
              <Metric label="Gols" value={stats.goals} tone="primary" icon={Target} />
              <Metric label="Assistências" value={stats.assists} tone="field" icon={Award} />
              {isGoalkeeper ? <Metric label="Defesas" value={stats.saves} tone="marker" icon={Shield} /> : <Metric label="Vitórias" value={stats.wins} tone="marker" icon={Sparkles} />}
            </div>
          </div>

          {isFull ? (
            <div className={clsx("rounded-lg border p-3 text-center shadow-line", shellBorderClass, shellSoftClass)}>
              <p className={clsx("text-[11px] font-black uppercase tracking-[0.18em]", shellMutedClass)}>Perfil</p>
              <p className="mt-1 text-3xl font-black tabular-nums text-primary-strong">{ratings.attack}</p>
              <p className={clsx("text-xs font-semibold", shellMutedClass)}>{isGoalkeeper ? "Reação" : "Ataque"}</p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Rating label="ATA" value={ratings.attack} />
          <Rating label="PAS" value={ratings.pass} />
          <Rating label="PRE" value={ratings.presence} />
          <Rating label="REG" value={ratings.regularity} />
          <Rating label="VIT" value={ratings.winning} />
          <Rating label="FAS" value={ratings.form} />
        </div>

        {isFull ? (
          <div className={clsx("grid gap-3 rounded-lg p-3 sm:grid-cols-[1fr_auto] sm:items-center", shellSoftClass)}>
            <div>
              <p className={clsx("text-xs font-black uppercase", shellMutedClass)}>Momento</p>
              <p className={clsx("mt-1 text-sm font-semibold", shellMutedClass)}>{stats.recentHighlight}</p>
            </div>
            <FormDots form={stats.form} />
          </div>
        ) : null}
        </div>
      </div>
    </article>
  );
}

function getPositionTitle(position: PlayerProfile["preferredPosition"]) {
  if (position === "goalkeeper") {
    return "Goleiro";
  }

  if (position === "defender") {
    return "Defensor";
  }

  if (position === "midfielder") {
    return "Meio-campo";
  }

  return "Atacante";
}

function Rating({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-canvas p-2 text-center">
      <p className="text-lg font-black tabular-nums">{value}</p>
      <p className="text-[11px] font-black uppercase text-muted">{label}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  icon: Icon
}: {
  label: string;
  value: number;
  tone: "primary" | "field" | "marker";
  icon: LucideIcon;
}) {
  const toneClass =
    tone === "primary" ? "bg-primary-soft text-primary-strong" : tone === "field" ? "bg-field-soft text-field" : "bg-marker-soft text-text";

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className={clsx("mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-black tabular-nums", toneClass)}>
        <Icon size={14} />
        {value}
      </div>
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
