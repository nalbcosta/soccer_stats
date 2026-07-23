"use client";

import { LocateFixed, MapPin } from "lucide-react";
import type { LocationResult } from "../../lib/api";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function MatchLocationCard({
  location,
  loading,
  error,
  onRequestLocation
}: {
  location: LocationResult | null;
  loading: boolean;
  error: string | null;
  onRequestLocation: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-strong">
            {location ? <MapPin size={18} /> : <LocateFixed size={18} />}
          </span>
          <div className="min-w-0">
            <p className="font-black">{location ? "Região detectada" : "Usar sua localização"}</p>
            <p className="mt-1 text-sm font-semibold text-muted">
              {location
                ? [location.city, location.state].filter(Boolean).join("/") || location.displayName
                : "Liberando a permissão, buscamos jogos próximos pelo backend."}
            </p>
            {error ? <p className="mt-2 text-sm font-semibold text-error">{error}</p> : null}
          </div>
        </div>
        <Button className="w-full sm:w-auto" disabled={loading} type="button" variant="secondary" onClick={onRequestLocation}>
          <LocateFixed size={17} />
          {loading ? "Localizando..." : location ? "Atualizar local" : "Liberar localização"}
        </Button>
      </div>
    </Card>
  );
}
