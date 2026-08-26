import clsx from "clsx";
import type { ReactNode } from "react";
import { Award, CalendarDays, Goal, ShieldCheck, Trophy } from "lucide-react";
import { FormDots } from "./form-dots";
import type { PlayerCardViewModel } from "../../lib/player-card/build-player-card-view-model";

type PlayerCardSize = "compact" | "full";

const metricIcons = [CalendarDays, Trophy, Goal, Award];

export function PlayerCard({ viewModel, size = "compact", className }: { viewModel: PlayerCardViewModel; size?: PlayerCardSize; className?: string }) {
  const isFull = size === "full";

  return (
    <article className={clsx("overflow-hidden rounded-xl border border-border bg-surface shadow-line", isFull ? "max-w-2xl lg:max-w-none" : "w-full", className)}>
      <header className="relative min-h-60 overflow-hidden bg-[linear-gradient(135deg,#08716d_0%,#0b443c_54%,#102421_100%)] p-4 text-white sm:min-h-72 sm:p-5 lg:min-h-80">
        {viewModel.identity.photoUrl ? <img alt={viewModel.identity.photoAlt} className="absolute inset-0 h-full w-full object-cover object-[center_18%] opacity-90" src={viewModel.identity.photoUrl} /> : null}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,15,.92)_0%,rgba(7,18,15,.58)_52%,rgba(7,18,15,.18)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(7,18,15,.62),transparent)]" />
        <div className="relative flex h-full flex-col justify-between gap-7 sm:gap-10">
          <div className="flex items-start justify-between gap-3">
            <p className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-[10px] font-black uppercase tracking-[.18em] text-white/75 backdrop-blur-sm">{viewModel.labels.cardName}</p>
            <div className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-right backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-white/70">{viewModel.labels.position}</p>
              <p className="mt-1 text-lg font-black">{viewModel.identity.positionCode}</p>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              {viewModel.identity.teamName ? <p className="truncate text-xs font-black uppercase tracking-[.14em] text-white/75">{viewModel.identity.teamName}</p> : null}
              <h2 className="truncate text-2xl font-black uppercase leading-none sm:text-3xl">{viewModel.identity.name}</h2>
              <p className="mt-1 text-sm font-semibold text-white/84">@{viewModel.identity.username}</p>
            </div>
            <span className="shrink-0 rounded-lg border border-white/15 bg-white/12 px-3 py-2 text-sm font-black backdrop-blur-sm">{viewModel.identity.shirtNumber}</span>
          </div>
        </div>
      </header>

      <div className="space-y-5 p-4 sm:p-5">
        <section>
          <p className="text-xs font-black uppercase tracking-[.14em] text-muted">{viewModel.labels.realData}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {viewModel.realMetrics.map(({ key, ...metric }, index) => { const Icon = metricIcons[index] ?? ShieldCheck; return <Metric icon={<Icon size={15} />} key={key} {...metric} />; })}
          </div>
        </section>

        {isFull && viewModel.attributes.length > 0 ? <section><p className="text-xs font-black uppercase tracking-[.14em] text-muted">{viewModel.labels.performance}</p><div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">{viewModel.attributes.map(({ key, ...attribute }) => <Attribute key={key} {...attribute} />)}</div></section> : null}

        {isFull ? <section className="rounded-xl bg-canvas p-3"><p className="text-xs font-black uppercase tracking-[.12em] text-muted">{viewModel.labels.moment}</p><div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"><p className="text-sm font-semibold leading-5">{viewModel.moment.label}</p><FormDots form={viewModel.moment.form} /></div></section> : null}
      </div>
    </article>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <div className="rounded-lg border border-border bg-canvas px-3 py-2.5"><div className="flex items-center gap-1.5 text-primary-strong">{icon}<p className="text-[10px] font-black uppercase tracking-[.12em] text-muted">{label}</p></div><p className="mt-1 text-2xl font-black tabular-nums">{value}</p></div>;
}

function Attribute({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-canvas px-3 py-2.5 text-center"><p className="text-xl font-black tabular-nums">{value}</p><p className="mt-0.5 text-[10px] font-black uppercase tracking-[.08em] text-muted">{label}</p></div>;
}
