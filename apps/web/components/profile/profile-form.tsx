"use client";

import { useEffect, useState, useTransition } from "react";
import type { PlayerProfile } from "@soccer-stats/shared";
import { Save } from "lucide-react";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

export function ProfileForm() {
  const { dashboard, refresh, setFeedback } = useSession();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    displayName: "",
    preferredFoot: "right" as PlayerProfile["preferredFoot"],
    preferredPosition: "midfielder" as PlayerProfile["preferredPosition"],
    bio: ""
  });

  useEffect(() => {
    if (dashboard?.profile) {
      setForm({
        displayName: dashboard.profile.displayName,
        preferredFoot: dashboard.profile.preferredFoot,
        preferredPosition: dashboard.profile.preferredPosition,
        bio: dashboard.profile.bio ?? ""
      });
    }
  }, [dashboard?.profile]);

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          void api.updateProfile(form).then(async () => {
            setFeedback("Perfil atualizado.");
            await refresh();
          });
        });
      }}
    >
      <Input placeholder="Nome de jogo" value={form.displayName} onChange={(event) => setForm((state) => ({ ...state, displayName: event.target.value }))} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Select
          value={form.preferredFoot}
          onChange={(event) => setForm((state) => ({ ...state, preferredFoot: event.target.value as PlayerProfile["preferredFoot"] }))}
        >
          <option value="right">Direita</option>
          <option value="left">Esquerda</option>
          <option value="both">Ambas</option>
        </Select>
        <Select
          value={form.preferredPosition}
          onChange={(event) =>
            setForm((state) => ({ ...state, preferredPosition: event.target.value as PlayerProfile["preferredPosition"] }))
          }
        >
          <option value="goalkeeper">Goleiro</option>
          <option value="defender">Defesa</option>
          <option value="midfielder">Meio</option>
          <option value="forward">Ataque</option>
        </Select>
      </div>
      <Input placeholder="Bio curta" value={form.bio} onChange={(event) => setForm((state) => ({ ...state, bio: event.target.value }))} />
      <Button disabled={isPending || form.displayName.length < 2} type="submit">
        <Save size={18} />
        Salvar card
      </Button>
    </form>
  );
}
