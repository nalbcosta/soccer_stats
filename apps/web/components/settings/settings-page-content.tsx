"use client";

import { PageHeading } from "../app/page-heading";
import { PreferencesPanel } from "../profile/preferences-panel";
import { Card } from "../ui/card";
import { Tabs } from "../ui/tabs";
import { useTranslations } from "../../i18n/provider";

export function SettingsPageContent() {
  const t = useTranslations("dashboard");
  const navigation = useTranslations("navigation");

  return (
    <>
      <PageHeading eyebrow={t("account")} title={navigation("settings")} />
      <Tabs
        items={[
          { href: "/app/profile", label: "Card" },
          { href: "/app/settings", label: navigation("settings"), active: true }
        ]}
        label={navigation("profileNavigation")}
      />
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr]">
        <PreferencesPanel />
        <Card className="p-4">
          <p className="text-xs font-black uppercase text-muted">{t("organization")}</p>
          <p className="mt-2 text-xl font-black">{t("settingsTitle")}</p>
          <p className="mt-2 text-sm font-semibold text-muted">{t("settingsDescription")}</p>
        </Card>
      </div>
    </>
  );
}
