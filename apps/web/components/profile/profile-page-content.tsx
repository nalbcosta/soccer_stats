"use client";

import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { PlayerCard } from "../sports/player-card";
import { Card } from "../ui/card";
import { Tabs } from "../ui/tabs";
import { PreferencesPanel } from "./preferences-panel";
import { ProfileForm } from "./profile-form";

export function ProfilePageContent() {
  const { dashboard, user } = useSession();

  if (!dashboard || !user) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeading eyebrow="Perfil" title="Seu card no NaBola" />
      <Tabs
        items={[
          { href: "/app/profile", label: "Card", active: true },
          { href: "/app/settings", label: "Ajustes" }
        ]}
        label="Navegação do perfil"
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <PlayerCard className="lg:col-span-2" profile={dashboard.profile} size="full" user={user} />
        <section className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-4 font-bold">Dados do jogador</p>
          <ProfileForm />
        </section>
        <div className="grid gap-4">
          <Card className="p-4">
            <p className="text-xs font-bold uppercase text-muted">Uso do card</p>
            <p className="mt-2 text-xl font-black">Ranking, perfil e comparações.</p>
            <p className="mt-1 text-sm text-muted">
              O card vira a identidade do jogador dentro da pelada, sem copiar visual de game famoso.
            </p>
          </Card>
          <PreferencesPanel />
        </div>
      </div>
    </>
  );
}
