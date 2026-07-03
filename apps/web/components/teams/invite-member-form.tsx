"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function InviteMemberForm({ teamId }: { teamId: string }) {
  const { refresh, setFeedback } = useSession();
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          void api
            .createInvite({ resourceType: "team", resourceId: teamId, email, role: "member" })
            .then(async () => {
              setEmail("");
              setFeedback("Convite enviado.");
              await refresh();
            });
        });
      }}
    >
      <Input placeholder="email@jogador.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <Button disabled={isPending || !email} type="submit">
        <Send size={18} />
        Convidar
      </Button>
    </form>
  );
}
