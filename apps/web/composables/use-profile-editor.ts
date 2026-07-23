"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlayerProfile } from "@soccer-stats/shared";
import { useTranslations } from "../i18n/provider";
import { api, resolveApiAssetUrl } from "../lib/api";
import { hasProfileChanges, toProfileFormState, toUpdateProfileInput, type ProfileFormState } from "../lib/profile/profile-form";
import { useSession } from "../components/app/session-provider";

const maxPhotoSizeInBytes = 5 * 1024 * 1024;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function useProfileEditor(profile: PlayerProfile) {
  const { refresh, setFeedback } = useSession();
  const t = useTranslations("profile");
  const [form, setForm] = useState<ProfileFormState>(() => toProfileFormState(profile));
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(toProfileFormState(profile));
    setSelectedPhotoFile(null);
  }, [profile]);

  useEffect(() => {
    if (!selectedPhotoFile) {
      setPhotoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPhotoFile);
    setPhotoPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhotoFile]);

  const previewPhotoUrl = photoPreviewUrl ?? (form.photoUrl ? resolveApiAssetUrl(form.photoUrl) : null);
  const hasChanges = useMemo(() => hasProfileChanges(form, profile, Boolean(selectedPhotoFile)), [form, profile, selectedPhotoFile]);

  const updateField = <Field extends keyof ProfileFormState>(field: Field, value: ProfileFormState[Field]) => {
    if (field === "photoUrl") setSelectedPhotoFile(null);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectPhoto = (file: File | null) => {
    if (file && (!acceptedPhotoTypes.has(file.type) || file.size > maxPhotoSizeInBytes)) {
      setSelectedPhotoFile(null);
      setFeedback(t("photoInvalid"), "error");
      return;
    }

    setSelectedPhotoFile(file);
  };

  const clearPhoto = () => {
    setSelectedPhotoFile(null);
    updateField("photoUrl", "");
  };

  const save = async () => {
    if (isSaving || !hasChanges || form.displayName.trim().length < 2) return;

    setIsSaving(true);
    try {
      await api.updateProfile(toUpdateProfileInput(form));
      if (selectedPhotoFile) await api.uploadProfilePhoto(selectedPhotoFile);

      await refresh();
      setFeedback(t("updated"));
    } catch {
      setFeedback(t("updateError"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return { form, previewPhotoUrl, selectedPhotoFile, isSaving, canSave: hasChanges && form.displayName.trim().length >= 2, updateField, selectPhoto, clearPhoto, save };
}
