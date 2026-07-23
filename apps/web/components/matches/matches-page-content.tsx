"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMatchesPage } from "../../composables/use-matches-page";
import { PageHeading } from "../app/page-heading";
import { LoadingState } from "../feedback/loading-state";
import { BottomSheet } from "../overlays/bottom-sheet";
import { Button } from "../ui/button";
import { MatchCreateForm } from "./match-create-form";
import { MatchDiscoverPanel } from "./match-discover-panel";
import { MatchFiltersBar } from "./match-filters-bar";
import { MatchList } from "./match-list";
import { MatchPageTabs } from "./match-page-tabs";
import { MatchPagination } from "./match-pagination";
import { Card } from "../ui/card";

export function MatchesPageContent() {
  const [open, setOpen] = useState(false);
  const {
    error,
    items,
    loading,
    loadingMatches,
    location,
    locationError,
    locationLoading,
    pagination,
    requestLocation,
    search,
    setPage,
    setSearch,
    setStatus,
    setTab,
    status,
    tab
  } = useMatchesPage();

  if (loading) {
    return <LoadingState label="Montando a rodada..." />;
  }

  return (
    <>
      <PageHeading
        eyebrow="Rodada"
        title="Jogos"
        action={
          <Button className="px-3" type="button" onClick={() => setOpen(true)}>
            <Plus size={18} />
            <span className="hidden sm:inline">Marcar jogo</span>
          </Button>
        }
      />

      <div className="grid gap-4">
        <MatchPageTabs activeTab={tab} onChange={setTab} />
        <MatchFiltersBar search={search} status={status} onSearchChange={setSearch} onStatusChange={setStatus} />
        {loadingMatches ? (
          <Card className="p-4 text-sm font-semibold text-muted">Buscando jogos...</Card>
        ) : null}
        {tab === "nearby" ? (
          <MatchDiscoverPanel
            error={error}
            items={items}
            location={location}
            locationError={locationError}
            locationLoading={locationLoading}
            onRequestLocation={requestLocation}
          />
        ) : (
          <>
            {error ? <Card className="border-error/30 p-4 text-sm font-semibold text-error">{error}</Card> : null}
            <MatchList
              emptyDescription="Escolha dois times e marque a primeira partida da turma."
              emptyTitle="Nenhum jogo marcado"
              items={items}
            />
          </>
        )}
        <MatchPagination pagination={pagination} onPageChange={setPage} />
      </div>

      <BottomSheet
        description="Monte a partida em poucos passos: times, horário e local."
        open={open}
        title="Marcar jogo"
        onClose={() => setOpen(false)}
      >
        <MatchCreateForm onCreated={() => setOpen(false)} />
      </BottomSheet>
    </>
  );
}
