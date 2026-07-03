"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function TeamCreateForm() {
  const { refresh, setFeedback } = useSession();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          void api.createTeam({ name }).then(async () => {
            setName("");
            setFeedback("Time criado.");
            await refresh();
          });
        });
      }}
    >
      <Input placeholder="Nome do time" value={name} onChange={(event) => setName(event.target.value)} />
      <Button disabled={isPending || name.length < 2} type="submit">
        <Plus size={18} />
        Criar time
      </Button>
    </form>
  );
}
