import type { PlayerCardViewModel } from "../../lib/player-card/build-player-card-view-model";
import { PlayerCard } from "../sports/player-card";

export function DashboardPlayerCardPanel({
  viewModel
}: {
  viewModel: PlayerCardViewModel;
}) {
  return <PlayerCard size="full" viewModel={viewModel} />;
}
