"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeading } from "../app/page-heading";
import { BottomSheet } from "../overlays/bottom-sheet";
import { Button } from "../ui/button";
import { MatchCreateForm } from "./match-create-form";
import { MatchList } from "./match-list";

export function MatchesPageContent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeading
        eyebrow="Rodada"
        title="Jogos marcados"
        action={
          <Button className="px-3" type="button" onClick={() => setOpen(true)}>
            <Plus size={18} />
            <span className="hidden sm:inline">Marcar jogo</span>
          </Button>
        }
      />
      <MatchList />
      <BottomSheet
        description="Escolha os times, data e contexto da partida."
        open={open}
        title="Marcar jogo"
        onClose={() => setOpen(false)}
      >
        <MatchCreateForm />
      </BottomSheet>
    </>
  );
}
