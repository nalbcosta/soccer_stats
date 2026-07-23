import { playerProfileSchema, type PlayerProfile, type UpdateProfileInput } from "@soccer-stats/shared";
import type { Repositories } from "../../types.js";

type PhotoMetadata = NonNullable<PlayerProfile["photoMetadata"]>;

function normalizeProfile(profile: unknown): PlayerProfile {
  const parsed = playerProfileSchema.parse(profile);

  return {
    userId: parsed.userId,
    displayName: parsed.displayName,
    ...(parsed.shirtNumber === undefined ? {} : { shirtNumber: parsed.shirtNumber }),
    ...(parsed.photoUrl === undefined ? {} : { photoUrl: parsed.photoUrl }),
    ...(parsed.photoMetadata === undefined ? {} : { photoMetadata: parsed.photoMetadata }),
    ...(parsed.primaryTeamId === undefined ? {} : { primaryTeamId: parsed.primaryTeamId }),
    ...(parsed.teamName === undefined ? {} : { teamName: parsed.teamName }),
    preferredFoot: parsed.preferredFoot,
    preferredPosition: parsed.preferredPosition,
    ...(parsed.bio === undefined ? {} : { bio: parsed.bio }),
    stats: parsed.stats
  };
}

function applyOptionalProfileFields(profile: PlayerProfile, input: UpdateProfileInput): PlayerProfile {
  const nextProfile: PlayerProfile = {
    ...profile,
    displayName: input.displayName.trim(),
    preferredFoot: input.preferredFoot,
    preferredPosition: input.preferredPosition
  };

  if (input.shirtNumber !== undefined) {
    if (input.shirtNumber === null) delete nextProfile.shirtNumber;
    else nextProfile.shirtNumber = input.shirtNumber;
  }

  if (input.bio !== undefined) {
    if (input.bio === null) delete nextProfile.bio;
    else nextProfile.bio = input.bio.trim();
  }

  if (input.photoUrl !== undefined) {
    if (input.photoUrl === null) delete nextProfile.photoUrl;
    else nextProfile.photoUrl = input.photoUrl;

    delete nextProfile.photoMetadata;
  }

  return nextProfile;
}

export class ProfileService {
  constructor(private readonly repositories: Repositories) {}

  async update(userId: string, input: UpdateProfileInput): Promise<{ profile: PlayerProfile; previousPhotoUrl?: string } | { reason: "not-found" | "invalid-team" }> {
    const storedProfile = await this.repositories.playerProfiles.findByUserId(userId);

    if (!storedProfile) return { reason: "not-found" };

    const existing = normalizeProfile(storedProfile);

    const nextProfile = applyOptionalProfileFields(existing, input);

    if (input.primaryTeamId !== undefined) {
      if (input.primaryTeamId === null) {
        delete nextProfile.primaryTeamId;
        delete nextProfile.teamName;
      } else {
        const teams = await this.repositories.teams.listByMember(userId);
        const selectedTeam = teams.find((team) => team.id === input.primaryTeamId);

        if (!selectedTeam) return { reason: "invalid-team" };

        nextProfile.primaryTeamId = selectedTeam.id;
        nextProfile.teamName = selectedTeam.name;
      }
    }

    const profile = await this.repositories.playerProfiles.upsert(nextProfile);

    return {
      profile,
      ...(existing.photoUrl && existing.photoUrl !== profile.photoUrl ? { previousPhotoUrl: existing.photoUrl } : {})
    };
  }

  async setPhoto(userId: string, photoUrl: string, photoMetadata: PhotoMetadata): Promise<{ profile: PlayerProfile; previousPhotoUrl?: string } | null> {
    const storedProfile = await this.repositories.playerProfiles.findByUserId(userId);

    if (!storedProfile) return null;

    const existing = normalizeProfile(storedProfile);
    const profile = await this.repositories.playerProfiles.upsert({ ...existing, photoUrl, photoMetadata });

    return {
      profile,
      ...(existing.photoUrl && existing.photoUrl !== photoUrl ? { previousPhotoUrl: existing.photoUrl } : {})
    };
  }
}
