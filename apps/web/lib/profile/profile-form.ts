import type { PlayerProfile } from "@soccer-stats/shared";
import type { UpdateProfileInput } from "../api";

export interface ProfileFormState {
  displayName: string;
  shirtNumber: string;
  photoUrl: string;
  primaryTeamId: string;
  preferredFoot: PlayerProfile["preferredFoot"];
  preferredPosition: PlayerProfile["preferredPosition"];
  bio: string;
}

export function toProfileFormState(profile: PlayerProfile): ProfileFormState {
  return {
    displayName: profile.displayName,
    shirtNumber: profile.shirtNumber ? String(profile.shirtNumber) : "",
    photoUrl: profile.photoUrl ?? "",
    primaryTeamId: profile.primaryTeamId ?? "",
    preferredFoot: profile.preferredFoot,
    preferredPosition: profile.preferredPosition,
    bio: profile.bio ?? ""
  };
}

export function toUpdateProfileInput(form: ProfileFormState): UpdateProfileInput {
  const shirtNumber = form.shirtNumber ? Number(form.shirtNumber) : null;

  return {
    displayName: form.displayName.trim(),
    shirtNumber,
    photoUrl: form.photoUrl.trim() || null,
    primaryTeamId: form.primaryTeamId || null,
    preferredFoot: form.preferredFoot,
    preferredPosition: form.preferredPosition,
    bio: form.bio.trim() || null
  };
}

export function hasProfileChanges(form: ProfileFormState, profile: PlayerProfile, hasNewPhoto: boolean) {
  return hasNewPhoto || JSON.stringify(toProfileFormState(profile)) !== JSON.stringify(form);
}
