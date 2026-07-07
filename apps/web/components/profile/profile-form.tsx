"use client";

import { useEffect, useState, useTransition } from "react";
import type { PlayerProfile } from "@soccer-stats/shared";
import { ImagePlus, Save } from "lucide-react";
import { api, resolveApiAssetUrl } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LazyImage } from "../ui/lazy-image";
import { Select } from "../ui/select";

export function ProfileForm() {
  const { dashboard, refresh, setFeedback } = useSession();
  const [isPending, startTransition] = useTransition();
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: "",
    shirtNumber: "",
    photoUrl: "",
    teamName: "",
    preferredFoot: "right" as PlayerProfile["preferredFoot"],
    preferredPosition: "midfielder" as PlayerProfile["preferredPosition"],
    bio: ""
  });

  useEffect(() => {
    if (dashboard?.profile) {
      setForm({
        displayName: dashboard.profile.displayName,
        shirtNumber: dashboard.profile.shirtNumber ? String(dashboard.profile.shirtNumber) : "",
        photoUrl: dashboard.profile.photoUrl ?? "",
        teamName: dashboard.profile.teamName ?? "",
        preferredFoot: dashboard.profile.preferredFoot,
        preferredPosition: dashboard.profile.preferredPosition,
        bio: dashboard.profile.bio ?? ""
      });
    }
  }, [dashboard?.profile]);

  useEffect(() => {
    if (!selectedPhotoFile) {
      setPhotoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPhotoFile);
    setPhotoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedPhotoFile]);

  const previewPhotoUrl = photoPreviewUrl ?? (form.photoUrl ? resolveApiAssetUrl(form.photoUrl) : null);

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          const payload: Parameters<typeof api.updateProfile>[0] = {
            displayName: form.displayName,
            preferredFoot: form.preferredFoot,
            preferredPosition: form.preferredPosition,
            ...(form.shirtNumber ? { shirtNumber: Number(form.shirtNumber) } : {}),
            ...(form.photoUrl.trim() ? { photoUrl: form.photoUrl.trim() } : {}),
            ...(form.teamName.trim() ? { teamName: form.teamName.trim() } : {}),
            ...(form.bio.trim() ? { bio: form.bio.trim() } : {})
          };

          void api
            .updateProfile(payload)
            .then(async () => {
              if (selectedPhotoFile) {
                await api.uploadProfilePhoto(selectedPhotoFile);
              }
              setSelectedPhotoFile(null);
              setFeedback("Perfil atualizado.");
              await refresh();
            })
            .catch((error: unknown) => {
              const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o perfil.";
              setFeedback(message, "error");
            });
        });
      }}
    >
      <div className="grid gap-3 rounded-lg border border-border bg-canvas p-3">
        <div className="field-grid relative min-h-36 overflow-hidden rounded-lg border border-border bg-surface">
          {previewPhotoUrl ? (
            <>
              <LazyImage
                alt="Preview da foto do jogador"
                className="absolute inset-0"
                imageClassName="h-full w-full object-cover"
                loadingClassName="bg-canvas/60"
                objectPosition="center 22%"
                src={previewPhotoUrl}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,36,33,0.18),rgba(16,36,33,0.48))]" />
            </>
          ) : null}
          {!previewPhotoUrl ? (
            <div className="flex min-h-36 items-center justify-center px-4 text-center text-sm font-semibold text-muted">
              Escolha uma foto ou cole uma URL para ver a previa do card.
            </div>
          ) : null}
        </div>
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-muted">Arquivo da foto</span>
          <Input
            accept="image/png,image/jpeg,image/webp"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedPhotoFile(file);
            }}
          />
        </label>
      </div>
      <Input placeholder="Nome de jogo" value={form.displayName} onChange={(event) => setForm((state) => ({ ...state, displayName: event.target.value }))} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Numero da camisa"
          inputMode="numeric"
          value={form.shirtNumber}
          onChange={(event) => setForm((state) => ({ ...state, shirtNumber: event.target.value.replace(/\D/g, "").slice(0, 2) }))}
        />
        <Input
          placeholder="URL da foto"
          value={form.photoUrl}
          onChange={(event) => setForm((state) => ({ ...state, photoUrl: event.target.value }))}
        />
      </div>
      <Input placeholder="Nome do time" value={form.teamName} onChange={(event) => setForm((state) => ({ ...state, teamName: event.target.value }))} />
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
        {selectedPhotoFile ? <ImagePlus size={18} /> : <Save size={18} />}
        Salvar card
      </Button>
    </form>
  );
}
