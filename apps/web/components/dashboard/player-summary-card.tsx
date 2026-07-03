import type { PlayerProfile, PublicUser } from "@soccer-stats/shared";
import { PlayerCard } from "../sports/player-card";

export function PlayerSummaryCard({ profile, user }: { profile: PlayerProfile | null; user: PublicUser }) {
  return <PlayerCard profile={profile} user={user} />;
}
