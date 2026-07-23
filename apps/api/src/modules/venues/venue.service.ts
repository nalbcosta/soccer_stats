import type { Venue } from "@soccer-stats/shared";
import type { Repositories, StoredUser } from "../../types.js";
import { createId, slugify } from "../../lib/ids.js";

interface CreateVenueInput {
  name: string;
  visibility: Venue["visibility"];
  address?: string | undefined;
  city: string;
  state: string;
  surface: Venue["surface"];
  latitude?: number | undefined;
  longitude?: number | undefined;
}

export class VenueService {
  constructor(private readonly repositories: Repositories) {}

  async create(user: StoredUser, input: CreateVenueInput): Promise<Venue> {
    const now = new Date().toISOString();
    return this.repositories.venues.create({
      id: createId(),
      name: input.name,
      slug: `${slugify(input.name)}-${createId().slice(0, 6)}`,
      ownerId: user.id,
      visibility: input.visibility,
      ...(input.address ? { address: input.address } : {}),
      city: input.city,
      state: input.state.toUpperCase(),
      surface: input.surface,
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
      createdAt: now,
      updatedAt: now
    });
  }

  async update(user: StoredUser, venueId: string, input: Partial<CreateVenueInput>): Promise<Venue | "not-found" | "forbidden"> {
    const venue = await this.repositories.venues.findById(venueId);

    if (!venue) {
      return "not-found";
    }

    if (venue.ownerId !== user.id) {
      return "forbidden";
    }

    return this.repositories.venues.update({
      ...venue,
      ...(input.name ? { name: input.name } : {}),
      ...(input.visibility ? { visibility: input.visibility } : {}),
      ...(input.address ? { address: input.address } : {}),
      ...(input.city ? { city: input.city } : {}),
      ...(input.surface ? { surface: input.surface } : {}),
      ...(input.state ? { state: input.state.toUpperCase() } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
      updatedAt: new Date().toISOString()
    });
  }

  canView(user: StoredUser, venue: Venue): boolean {
    return venue.visibility === "public" || venue.ownerId === user.id;
  }
}
