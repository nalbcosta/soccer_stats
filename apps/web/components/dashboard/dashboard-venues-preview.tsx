import Link from "next/link";
import type { Venue } from "@soccer-stats/shared";
import { MapPin } from "lucide-react";
import { EmptyState } from "../feedback/empty-state";
import { Card } from "../ui/card";

const surfaceLabel: Record<Venue["surface"], string> = {
  grass: "Grama",
  synthetic: "Sintético",
  court: "Quadra",
  sand: "Areia",
  other: "Outro"
};

export function DashboardVenuesPreview({ venues }: { venues: Venue[] }) {
  if (venues.length === 0) {
    return (
      <EmptyState
        actionHref="/app/matches"
        actionLabel="Usar em uma partida"
        description="Os campos e quadras cadastrados aparecem aqui para acelerar novos jogos."
        title="Nenhum local salvo"
      />
    );
  }

  return (
    <section className="grid gap-3">
      <div>
        <p className="text-xs font-black uppercase text-field">Locais</p>
        <h2 className="mt-1 text-xl font-black">Campos da turma</h2>
      </div>

      <Card className="overflow-hidden">
        {venues.map((venue) => (
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0" key={venue.id}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-field-soft text-field">
              <MapPin size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-black">{venue.name}</p>
              <p className="truncate text-sm font-semibold text-muted">
                {venue.city}/{venue.state} - {surfaceLabel[venue.surface]}
              </p>
            </div>
          </div>
        ))}
      </Card>

      <Link className="text-sm font-black text-primary-strong" href="/app/matches">
        Marcar jogo nesses locais
      </Link>
    </section>
  );
}
