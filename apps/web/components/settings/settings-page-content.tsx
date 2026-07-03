"use client";

import { PageHeading } from "../app/page-heading";
import { PreferencesPanel } from "../profile/preferences-panel";
import { Card } from "../ui/card";
import { Tabs } from "../ui/tabs";

export function SettingsPageContent() {
  return (
    <>
      <PageHeading eyebrow="Conta" title="Ajustes" />
      <Tabs
        items={[
          { href: "/app/profile", label: "Card" },
          { href: "/app/settings", label: "Ajustes", active: true }
        ]}
        label="Navegacao do perfil"
      />
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr]">
        <PreferencesPanel />
        <Card className="p-4">
          <p className="text-xs font-black uppercase text-muted">Organizacao</p>
          <p className="mt-2 text-xl font-black">Preferencias fora do perfil.</p>
          <p className="mt-2 text-sm font-semibold text-muted">
            Esta rota separa configuracoes de conta do card de jogador, deixando o perfil livre para identidade, numeros e historico.
          </p>
        </Card>
      </div>
    </>
  );
}
