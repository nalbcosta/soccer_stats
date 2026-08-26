"use client";

import { PageHeading } from "../app/page-heading";
import { PreferencesPanel } from "../profile/preferences-panel";
import { Tabs } from "../ui/tabs";
import { useTranslations } from "../../i18n/provider";
import { AccountSettingsPanel } from "./account-settings-panel";

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
        <AccountSettingsPanel />
      </div>
    </>
  );
}
