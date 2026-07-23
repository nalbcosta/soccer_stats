"use client";

import { ImagePlus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "../../i18n/provider";
import { useProfileEditor } from "../../composables/use-profile-editor";
import type { PlayerProfile, Team } from "@soccer-stats/shared";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { PositionSelector } from "./position-selector";
import { PhotoDropSurface, PhotoUpload } from "./photo-upload";

export function ProfileForm({ profile, teams }: { profile: PlayerProfile; teams: Team[] }) {
  const t = useTranslations("profile");
  const { form, previewPhotoUrl, isSaving, canSave, updateField, selectPhoto, clearPhoto, save } = useProfileEditor(profile);
  const [photoStatus, setPhotoStatus] = useState<"idle" | "loading" | "loaded" | "error">(previewPhotoUrl ? "loading" : "error");

  useEffect(() => {
    setPhotoStatus(previewPhotoUrl ? "loading" : "error");
  }, [previewPhotoUrl]);

  return (
    <form className="grid gap-6" onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <section className="grid gap-4" aria-labelledby="profile-photo-title">
        <div>
          <h3 id="profile-photo-title" className="font-bold">{t("photo")}</h3>
          <p className="mt-1 text-sm text-muted">{t("photoDescription")}</p>
        </div>
        <div className="relative min-h-44 overflow-hidden rounded-xl border border-dashed border-border bg-canvas">
          {previewPhotoUrl && photoStatus !== "error" ? (
            <PhotoDropSurface onFile={selectPhoto} showHover={photoStatus === "loaded"}>
              <div className="relative min-h-44 overflow-hidden rounded-xl">
                <img
                  alt={t("photoPreviewAlt")}
                  className="absolute inset-0 h-full w-full object-cover"
                  decoding="async"
                  src={previewPhotoUrl}
                  style={{ objectPosition: "center 22%" }}
                  onError={() => setPhotoStatus("error")}
                  onLoad={() => setPhotoStatus("loaded")}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,36,33,0.08),rgba(16,36,33,0.42))]" />
                <Button className="absolute right-3 top-3 z-30" type="button" variant="secondary" onClick={clearPhoto}>
                  <X size={16} />
                  {t("removePhoto")}
                </Button>
              </div>
            </PhotoDropSurface>
          ) : (
            <PhotoUpload
              className="h-full min-h-44 border-0 bg-transparent p-0"
              hasPhoto={false}
              labelClassName="min-h-44 flex-col justify-center text-center"
              onFile={selectPhoto}
            />
          )}
        </div>
      </section>

      <fieldset className="grid gap-3 border-t border-border pt-5">
        <legend className="font-bold">{t("identity")}</legend>
        <label className="grid gap-2">
          <span className="text-sm font-semibold">{t("displayName")}</span>
          <Input required maxLength={40} minLength={2} value={form.displayName} onChange={(event) => updateField("displayName", event.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">{t("shirtNumber")}</span>
            <Input inputMode="numeric" maxLength={2} value={form.shirtNumber} onChange={(event) => updateField("shirtNumber", event.target.value.replace(/\D/g, "").slice(0, 2))} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">{t("primaryTeam")}</span>
            <Select value={form.primaryTeamId} onChange={(event) => updateField("primaryTeamId", event.target.value)}>
              <option value="">{t("noPrimaryTeam")}</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </Select>
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-3 border-t border-border pt-5">
        <legend className="font-bold">{t("onField")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">{t("preferredFoot")}</span>
            <Select value={form.preferredFoot} onChange={(event) => updateField("preferredFoot", event.target.value as PlayerProfile["preferredFoot"])}>
              <option value="right">{t("footRight")}</option><option value="left">{t("footLeft")}</option><option value="both">{t("footBoth")}</option>
            </Select>
          </label>
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-semibold">{t("preferredPosition")}</span>
          <PositionSelector value={form.preferredPosition} onChange={(position) => updateField("preferredPosition", position)} />
        </div>
      </fieldset>

      <label className="grid gap-2 border-t border-border pt-5">
        <span className="flex items-center justify-between gap-3 text-sm font-semibold"><span>{t("bio")}</span><span className="text-xs font-medium text-muted">{form.bio.length}/160</span></span>
        <textarea className="min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-3 text-sm text-text outline-none transition focus:border-primary" maxLength={160} value={form.bio} onChange={(event) => updateField("bio", event.target.value)} />
        <span className="text-xs text-muted">{t("bioHint")}</span>
      </label>

      <Button className="w-full sm:w-auto sm:justify-self-end" disabled={!canSave || isSaving} type="submit">
        {isSaving ? <ImagePlus size={18} /> : <Save size={18} />}
        {isSaving ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
