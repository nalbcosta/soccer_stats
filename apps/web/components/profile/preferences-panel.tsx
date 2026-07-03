"use client";

import { LogOut } from "lucide-react";
import { LocaleToggle } from "../locale-toggle";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { useSession } from "../app/session-provider";

export function PreferencesPanel() {
  const { logout, feedback } = useSession();

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <p className="font-bold">Preferencias</p>
      <div className="mt-4 grid gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-muted">Idioma</p>
          <LocaleToggle />
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-muted">Tema</p>
          <ThemeToggle />
        </div>
        {feedback ? <p className="rounded-lg bg-marker-soft p-3 text-sm font-semibold">{feedback.message}</p> : null}
        <Button type="button" variant="secondary" onClick={() => void logout()}>
          <LogOut size={18} />
          Sair da conta
        </Button>
      </div>
    </section>
  );
}
