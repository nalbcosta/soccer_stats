"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Languages, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale } from "../../../i18n/provider";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import type { LandingDictionary } from "../../../i18n/messages/landing";

export const sectionTransition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1] as const
};

export function Reveal({
  children,
  className,
  delay = 0,
  hoverLift = false
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverLift?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ ...sectionTransition, delay }}
      viewport={{ once: true, amount: 0.25 }}
      {...(hoverLift ? { whileHover: { y: -4 } } : {})}
    >
      {children}
    </motion.div>
  );
}

export function LocaleToggleButton() {
  const { locale, setLocale } = useLocale();
  const nextLocale = locale === "pt-BR" ? "en" : "pt-BR";
  const nextLabel = nextLocale === "pt-BR" ? "PT" : "EN";

  return (
    <Button
      type="button"
      variant="secondary"
      className="min-w-[5.5rem] justify-center rounded-full border border-border bg-surface px-3 text-xs font-black uppercase tracking-[0.16em] text-text shadow-line sm:min-w-0 sm:w-auto sm:px-4"
      onClick={() => setLocale(nextLocale)}
      title={nextLocale === "pt-BR" ? "Mudar para portugues" : "Switch to English"}
      aria-label={nextLocale === "pt-BR" ? "Mudar para portugues" : "Switch to English"}
    >
      <Languages size={15} />
      <span>{nextLabel}</span>
    </Button>
  );
}

export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="secondary"
      className={`h-11 w-11 justify-center rounded-full border border-border px-0 text-xs font-black uppercase tracking-[0.16em] shadow-line sm:min-w-[7.25rem] sm:w-auto sm:px-4 ${
        isDark ? "bg-primary-soft text-primary-strong" : "bg-surface text-text"
      }`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? <Moon size={15} /> : <Sun size={15} />}
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </Button>
  );
}

export function MiniSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-2 py-3 text-center shadow-line sm:px-4 sm:py-4">
      <p className="text-xl font-black tabular-nums sm:text-2xl">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase leading-3 tracking-[0.12em] text-muted sm:text-[11px] sm:leading-4 sm:tracking-[0.16em]">
        {label}
      </p>
    </div>
  );
}

export function FlowCard({
  icon: Icon,
  title,
  description
}: {
  icon: LandingDictionary["flow"]["items"][number]["icon"];
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-lg p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-soft text-primary-strong">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-base font-black">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted">{description}</p>
        </div>
      </div>
    </Card>
  );
}

export function Quote({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/10 p-5 backdrop-blur">
      <p className="text-sm font-black leading-6 text-white">{text}</p>
    </div>
  );
}

export function BackToTopTrigger({
  label,
  open,
  onClick
}: {
  label: string;
  open: boolean;
  onClick: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={sectionTransition}
      className="fixed bottom-4 left-4 z-50 md:bottom-6 md:left-6"
    >
      <Button
        type="button"
        variant="secondary"
        className="py-4 rounded-full bg-surface/92 px-0 shadow-panel backdrop-blur"
        onClick={onClick}
        title={label}
        aria-label={label}
      >
        <ArrowUp size={18}/>
      </Button>
    </motion.div>
  );
}
