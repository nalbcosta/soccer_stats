"use client";

import { useState, useTransition } from "react";
import { Trophy } from "lucide-react";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

export function TournamentCreateForm() {
  const { dashboard, refresh, setFeedback } = useSession();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [teamIds, setTeamIds] = useState<string[]>([]);

  return (
    <form
      className="grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          void api.createTournament({ name, teamIds }).then(async () => {
            setName("");
            setTeamIds([]);
            setFeedback("Copa criada.");
            await refresh();
          });
        });
      }}
    >
      <Input placeholder="Nome da copa" value={name} onChange={(event) => setName(event.target.value)} />
      <Select
        className="min-h-28"
        multiple
        value={teamIds}
        onChange={(event) => setTeamIds(Array.from(event.target.selectedOptions).map((option) => option.value))}
      >
        {(dashboard?.teams ?? []).map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </Select>
      <Button disabled={isPending || name.length < 2 || teamIds.length < 2} type="submit">
        <Trophy size={18} />
        Criar copa
      </Button>
    </form>
  );
}
