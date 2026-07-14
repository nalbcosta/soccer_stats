import type { PlayerProfile, PublicUser } from "@soccer-stats/shared";
import { buildPlayerCardViewModel } from "../../lib/player-card/build-player-card-view-model";
import { PlayerCard } from "../sports/player-card";

export function PlayerSummaryCard({ profile, user }: { profile: PlayerProfile | null; user: PublicUser }) {
  return <PlayerCard viewModel={buildPlayerCardViewModel(profile, user, null)} />;
}
