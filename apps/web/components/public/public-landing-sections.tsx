"use client";

import { useEffect, useState } from "react";
import type { LandingDictionary } from "../../i18n/messages/landing";
import {
  BackToTopModal,
  CallToActionSection,
  FaqSection,
  FeatureGridSection,
  FlowSection,
  HeroSection,
  LandingFooter,
  LandingProgressBar,
  PreviewSection,
  ProofSection
} from "./landing/landing-sections-core";
import { BackToTopTrigger } from "./landing/landing-shared";

export function LandingPage({ content }: { content: LandingDictionary }) {
  const [isTopModalOpen, setIsTopModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 120);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <LandingProgressBar />
      <main className="min-h-screen bg-canvas text-text">
        <HeroSection content={content} />
        <PreviewSection content={content} />
        <FeatureGridSection content={content} />
        <FlowSection content={content} />
        <ProofSection content={content} />
        <FaqSection content={content} />
        <CallToActionSection content={content} />
      </main>
      <LandingFooter content={content} />
      <BackToTopTrigger
        label={content.footer.actions.top}
        open={showBackToTop}
        onClick={() => setIsTopModalOpen(true)}
      />
      <BackToTopModal content={content.topModal} open={isTopModalOpen} onClose={() => setIsTopModalOpen(false)} />
    </>
  );
}
