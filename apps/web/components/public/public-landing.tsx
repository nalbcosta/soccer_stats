"use client";

import { landingContent } from "./public-landing-content";
import { LandingPage } from "./public-landing-sections";
import { useLocale } from "../locale-provider";

export function PublicLanding() {
  const { locale } = useLocale();
  const content = landingContent[locale];

  return <LandingPage content={content} />;
}
