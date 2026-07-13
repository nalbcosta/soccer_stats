"use client";

import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { PlayerCard } from "../sports/player-card";
import { Card } from "../ui/card";
import { Tabs } from "../ui/tabs";
import { PreferencesPanel } from "./preferences-panel";
import { ProfileForm } from "./profile-form";
import { useTranslations } from "../../i18n/provider";

export function ProfilePageContent() {
  const { dashboard, user } = useSession();
  const t = useTranslations("dashboard");
  const navigation = useTranslations("navigation");

  if (!dashboard || !user) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeading eyebrow={navigation("profile")} title={t("profileCard")} />
      <Tabs
        items={[
          { href: "/app/profile", label: "Card", active: true },
          { href: "/app/settings", label: navigation("settings") }
        ]}
        label={navigation("profileNavigation")}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <PlayerCard className="lg:col-span-2" profile={dashboard.profile} size="full" user={user} />
        <section className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-4 font-bold">{t("playerData")}</p>
          <ProfileForm />
        </section>
        <div className="grid gap-4">
          <Card className="p-4">
            <p className="text-xs font-bold uppercase text-muted">{t("cardUsage")}</p>
            <p className="mt-2 text-xl font-black">{t("cardUsageTitle")}</p>
            <p className="mt-1 text-sm text-muted">{t("cardUsageDescription")}</p>
          </Card>
          <PreferencesPanel />
        </div>
      </div>
    </>
  );
}
