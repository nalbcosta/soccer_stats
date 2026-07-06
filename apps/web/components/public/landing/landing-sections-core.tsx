"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, BarChart3, ChevronRight, LogIn, Shield, Trophy, X } from "lucide-react";
import type { LandingDictionary } from "../public-landing-content";
import { AnimatedFieldGrid } from "../animated-field-grid";
import { demoHomeTeam, demoAwayTeam, demoMatch, demoPlayerNames, demoProfile, demoTournament, demoUser } from "./landing-demo-data";
import { FlowCard, LocaleToggleButton, MiniSignal, Quote, Reveal, ThemeToggleButton, sectionTransition } from "./landing-shared";
import { ComparisonBar } from "../../sports/comparison-bar";
import { PlayerCard } from "../../sports/player-card";
import { ScoreboardCard } from "../../sports/scoreboard-card";
import { StatTile } from "../../sports/stat-tile";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";

const previewIcons = [Trophy, BarChart3, Shield] as const;

export function LandingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.2
  });

  return <motion.div className="fixed inset-x-0 top-0 z-[80] h-1 origin-left bg-primary" style={{ scaleX }} />;
}

export function LandingHeader({ content }: { content: LandingDictionary }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-3 md:px-6 sm:flex sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3 font-black">
          <span className="field-grid relative grid h-10 w-10 place-items-center rounded-lg bg-field text-sm text-white shadow-line">NB</span>
          <span className="text-lg">NaBola</span>
        </Link>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <div className="grid min-w-0 gap-1">
            <p className="hidden px-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted sm:block">{content.nav.localeLabel}</p>
            <LocaleToggleButton />
          </div>
          <div className="grid min-w-0 gap-1">
            <p className="hidden px-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted sm:block">{content.nav.themeLabel}</p>
            <ThemeToggleButton />
          </div>
          <Link
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-glow sm:min-h-10 sm:w-auto sm:px-4"
            href="/login"
            title={content.nav.login}
            aria-label={content.nav.login}
          >
            <LogIn size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function HeroSection({ content }: { content: LandingDictionary }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section className="relative overflow-hidden border-b border-border" id="top">
      <AnimatedFieldGrid className="opacity-95" />
      <motion.div className="absolute inset-0 opacity-80" style={{ y }}>
        <div className="absolute left-[8%] top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-10 right-[8%] h-56 w-56 rounded-full bg-field/15 blur-3xl" />
      </motion.div>

      <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-6xl content-center gap-8 px-4 py-8 sm:py-12 md:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
        <Reveal className="relative z-10">
          <Badge tone="primary" className="px-3 py-1 text-[11px]">
            {content.hero.badge}
          </Badge>
          <h1 className="mt-5 max-w-3xl text-[2.35rem] font-black leading-[1.05] sm:text-5xl md:text-6xl">{content.hero.title}</h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-muted md:text-lg">{content.hero.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-white shadow-glow"
              href="/login"
            >
              {content.hero.primaryCta}
              <ArrowRight size={18} />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-surface/80 px-6 text-sm font-black text-text shadow-line"
              href="#preview"
            >
              {content.hero.secondaryCta}
              <ChevronRight size={18} />
            </Link>
          </div>
        </Reveal>

        <Reveal className="relative z-10" delay={0.08}>
          <div className="rounded-xl border border-border bg-surface/86 p-2 shadow-panel backdrop-blur-xl sm:p-4">
            <div className="grid gap-3 rounded-lg bg-canvas/92 p-2 sm:p-3">
              <ScoreboardCard
                awayName={demoAwayTeam.name}
                awayScore={demoMatch.away.score}
                eyebrow={content.hero.liveCard.eyebrow}
                homeName={demoHomeTeam.name}
                homeScore={demoMatch.home.score}
                match={demoMatch}
                meta={content.hero.liveCard.meta}
                playerNames={demoPlayerNames}
                status="completed"
                tournament={demoTournament}
              />
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {content.hero.stats.map((item) => (
                  <MiniSignal key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function PreviewSection({ content }: { content: LandingDictionary }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:gap-10 md:px-6 md:py-14" id="preview">
      <Reveal className="grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-field">{content.preview.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">{content.preview.title}</h2>
        </div>
        <p className="text-sm font-semibold leading-6 text-muted md:text-base">{content.preview.description}</p>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal className="mx-auto w-full max-w-[640px] lg:max-w-none">
          <PlayerCard profile={demoProfile} size="full" user={demoUser} />
        </Reveal>
        <Reveal className="grid gap-4" delay={0.08}>
          <div className="grid gap-3 sm:grid-cols-3">
            {content.preview.statTiles.map((item, index) => (
              <StatTile
                key={item.label}
                icon={previewIcons[index] ?? Trophy}
                label={item.label}
                value={item.value}
                helper={item.helper}
                tone={index === 1 ? "field" : index === 2 ? "marker" : "primary"}
              />
            ))}
          </div>
          <Card className="rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">{content.preview.comparisonTitle}</p>
            <div className="mt-4 grid gap-4">
              {content.preview.comparison.map((item) => (
                <ComparisonBar key={item.label} helper={item.helper} label={item.label} max={18} tone="field" value={item.value} />
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

export function FeatureGridSection({ content }: { content: LandingDictionary }) {
  return (
    <section className="border-y border-border bg-surface/75">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black md:text-4xl">{content.features.title}</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {content.features.items.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title} delay={index * 0.05} hoverLift>
                <Card className="h-full rounded-lg p-5">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary-soft text-primary-strong">
                    <Icon size={22} />
                  </div>
                  <p className="mt-5 text-lg font-black">{item.title}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-muted">{item.description}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FlowSection({ content }: { content: LandingDictionary }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:px-6 lg:grid-cols-[0.82fr_1.18fr]">
      <Reveal>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-field">{content.flow.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black md:text-4xl">{content.flow.title}</h2>
        <p className="mt-4 text-sm font-semibold leading-6 text-muted md:text-base">{content.flow.description}</p>
      </Reveal>
      <div className="grid gap-3 sm:grid-cols-2">
        {content.flow.items.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.05}>
            <FlowCard icon={item.icon} title={item.title} description={item.description} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ProofSection({ content }: { content: LandingDictionary }) {
  return (
    <section className="border-y border-border bg-text text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:px-6 lg:grid-cols-[1fr_0.84fr]">
        <Reveal>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-marker">{content.proof.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">{content.proof.title}</h2>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/72 md:text-base">{content.proof.description}</p>
        </Reveal>
        <div className="grid gap-3">
          {content.proof.quotes.map((item, index) => (
            <Reveal key={item.text} delay={index * 0.05}>
              <Quote text={item.text} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ content }: { content: LandingDictionary }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Reveal>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-field">{content.faq.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black md:text-4xl">{content.faq.title}</h2>
      </Reveal>
      <div className="grid gap-3">
        {content.faq.items.map((item, index) => (
          <Reveal key={item.question} delay={index * 0.04}>
            <Card className="rounded-lg p-5">
              <p className="text-base font-black">{item.question}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted">{item.answer}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CallToActionSection({ content }: { content: LandingDictionary }) {
  return (
    <section className="mx-auto px-4 pb-10 md:px-6">
      <Reveal className="field-grid relative mx-auto grid max-w-6xl gap-4 overflow-hidden rounded-xl border border-border bg-surface/85 p-6 shadow-panel backdrop-blur md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-field">{content.cta.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">{content.cta.title}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">{content.cta.description}</p>
        </div>
        <Link
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-white shadow-glow"
          href="/login"
        >
          {content.cta.button}
          <ArrowRight size={18} />
        </Link>
      </Reveal>
    </section>
  );
}

export function LandingFooter({ content }: { content: LandingDictionary }) {
  return (
    <footer className="border-t border-border bg-surface/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="field-grid relative grid h-10 w-10 place-items-center rounded-lg bg-field text-sm font-black text-white shadow-line">NB</span>
            <p className="text-lg font-black">NaBola</p>
          </div>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-muted">{content.footer.description}</p>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-muted">{content.footer.product}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {content.footer.productLinks.map((item) => (
              <span key={item} className="rounded-full border border-border bg-canvas px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-3 justify-self-start md:justify-self-end">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-black text-white shadow-glow"
            href="/login"
          >
            {content.footer.actions.login}
          </Link>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs font-semibold text-muted md:px-6">
        {content.footer.copyright}
      </div>
    </footer>
  );
}

export function BackToTopModal({
  content,
  open,
  onClose
}: {
  content: LandingDictionary["topModal"];
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[var(--modal-overlay)] px-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close modal" onClick={onClose} />
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={sectionTransition}
        className="relative w-full max-w-md rounded-[28px] border border-border bg-surface p-6 shadow-panel"
      >
        <Button className="absolute right-4 top-4 min-h-8 rounded-full px-2" type="button" variant="ghost" onClick={onClose} title="Close">
          <X size={16} />
        </Button>
        <p className="pr-8 text-2xl font-black tracking-tight">{content.title}</p>
        <p className="mt-3 text-sm font-semibold leading-6 text-muted">{content.description}</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {content.cancel}
          </Button>
          <Button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              onClose();
            }}
          >
            {content.confirm}
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
