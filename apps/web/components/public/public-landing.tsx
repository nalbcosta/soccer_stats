"use client";

import { landingContent } from "../../i18n/messages/landing";
import { LandingPage } from "./public-landing-sections";
import { useLocale } from "../../i18n/provider";

export function PublicLanding() {
  const { locale } = useLocale();
  const content = landingContent[locale];

  return <LandingPage content={content} />;
}
