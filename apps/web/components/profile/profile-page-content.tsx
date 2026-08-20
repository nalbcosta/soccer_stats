"use client";

import { PageHeading } from "../app/page-heading";
import { LoadingState } from "../feedback/loading-state";
import { PlayerCard } from "../sports/player-card";
import { Card } from "../ui/card";
import { Tabs } from "../ui/tabs";
import { ProfileForm } from "./profile-form";
import { useTranslations } from "../../i18n/provider";
import { useProfilePage } from "../../composables/use-profile-page";
import { buildPlayerCardViewModel } from "../../lib/player-card/build-player-card-view-model";
import { AthleteSkillsForm } from "./athlete-skills-form";

export function ProfilePageContent() {
  const { card, profile, teams, user, isLoading } = useProfilePage();
  const t = useTranslations("profile");
  const navigation = useTranslations("navigation");

  if (isLoading || !profile || !user) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeading eyebrow={navigation("profile")} title={t("title")} />
      <Tabs
        items={[
          { href: "/app/profile", label: t("card"), active: true },
          { href: "/app/settings", label: navigation("settings") }
        ]}
        label={navigation("profileNavigation")}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.78fr)] xl:items-start">
        <div className="grid gap-4 xl:sticky xl:top-24">
          <PlayerCard size="full" viewModel={buildPlayerCardViewModel(profile, user, card, t)} />
          <Card className="p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{t("cardUsage")}</p>
            <p className="mt-2 text-lg font-black sm:text-xl">{t("cardUsageTitle")}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{t("cardUsageDescription")}</p>
          </Card>
        </div>
        <div className="grid gap-4">
        <AthleteSkillsForm required={teams.length > 0} />
        <section className="rounded-xl border border-border bg-surface p-4 shadow-line sm:p-5">
          <div className="mb-6 border-b border-border pb-5">
            <h2 className="text-lg font-black">{t("playerData")}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">{t("editDescription")}</p>
          </div>
          <ProfileForm profile={profile} teams={teams} />
        </section>
        </div>
      </div>
    </>
  );
}
