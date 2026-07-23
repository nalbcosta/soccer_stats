import type { LucideIcon } from "lucide-react";

type LandingFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type LandingFlow = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type LandingFaq = {
  question: string;
  answer: string;
};

type LandingQuote = {
  text: string;
};

export type LandingDictionary = {
  nav: {
    login: string;
    themeLabel: string;
    localeLabel: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    stats: Array<{ label: string; value: string }>;
    liveCard: {
      eyebrow: string;
      meta: string;
    };
  };
  preview: {
    eyebrow: string;
    title: string;
    description: string;
    statTiles: Array<{ label: string; value: string; helper: string }>;
    comparisonTitle: string;
    comparison: Array<{ label: string; helper: string; value: number }>;
  };
  features: {
    title: string;
    items: LandingFeature[];
  };
  flow: {
    eyebrow: string;
    title: string;
    description: string;
    items: LandingFlow[];
  };
  proof: {
    eyebrow: string;
    title: string;
    description: string;
    quotes: LandingQuote[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: LandingFaq[];
  };
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
  };
  footer: {
    description: string;
    product: string;
    productLinks: string[];
    actions: {
      login: string;
      top: string;
    };
    copyright: string;
  };
  topModal: {
    title: string;
    description: string;
    confirm: string;
    cancel: string;
  };
};


