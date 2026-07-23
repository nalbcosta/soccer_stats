"use client";

import { Search } from "lucide-react";
import type { MatchStatusFilter } from "../../composables/use-matches-page";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

const statusOptions: Array<{ value: MatchStatusFilter; label: string }> = [
  { value: "all", label: "Todos os status" },
  { value: "scheduled", label: "Marcados" },
  { value: "confirming", label: "Confirmando" },
  { value: "completed", label: "Encerrados" },
  { value: "cancelled", label: "Cancelados" }
];

export function MatchFiltersBar({
  search,
  status,
  onSearchChange,
  onStatusChange
}: {
  search: string;
  status: MatchStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: MatchStatusFilter) => void;
}) {
  return (
    <div className="grid gap-2 rounded-lg border border-border bg-surface p-3 shadow-line sm:grid-cols-[1fr_180px]">
      <label className="relative block">
        <span className="sr-only">Buscar jogos</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
        <Input
          className="pl-10"
          placeholder="Buscar por time, local ou cidade"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <label>
        <span className="sr-only">Filtrar por status</span>
        <Select value={status} onChange={(event) => onStatusChange(event.target.value as MatchStatusFilter)}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
