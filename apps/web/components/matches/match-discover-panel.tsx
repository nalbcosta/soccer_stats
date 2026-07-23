import { MapPin, Search } from "lucide-react";
import type { MatchListItem } from "../../composables/use-matches-page";
import type { LocationResult } from "../../lib/api";
import { EmptyState } from "../feedback/empty-state";
import { Card } from "../ui/card";
import { MatchLocationCard } from "./match-location-card";
import { MatchList } from "./match-list";

export function MatchDiscoverPanel({
  error,
  items,
  location,
  locationError,
  locationLoading,
  onRequestLocation
}: {
  error: string | null;
  items: MatchListItem[];
  location: LocationResult | null;
  locationError: string | null;
  locationLoading: boolean;
  onRequestLocation: () => void;
}) {
  return (
    <section className="grid gap-3">
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-strong">
            <Search size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-black">Encontrar jogos perto de você</p>
            <p className="mt-1 text-sm font-semibold text-muted">
              Mostramos partidas visíveis com local ou região parecida com seus times e campos salvos.
            </p>
          </div>
        </div>
      </Card>

      <MatchLocationCard error={locationError} loading={locationLoading} location={location} onRequestLocation={onRequestLocation} />

      {error ? (
        <Card className="border-error/30 p-4 text-sm font-semibold text-error">
          {error}
        </Card>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          actionHref="/app/matches"
          actionLabel="Marcar jogo"
          description="Quando houver partidas com local cadastrado, elas aparecem aqui para facilitar novos encontros."
          title="Nada na região ainda"
        />
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-muted">
            <MapPin size={15} />
            Jogos com local
          </div>
          <MatchList emptyDescription="" emptyTitle="" items={items} />
        </>
      )}
    </section>
  );
}
