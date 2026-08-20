"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function InviteMemberForm({ teamId }: { teamId: string }) {
  const { refresh, setFeedback } = useSession();
  const [publicIdentifier, setPublicIdentifier] = useState("");
  const [isPending, startTransition] = useTransition();
  const isValidIdentifier = /^#[0-9A-F]{6}$/.test(publicIdentifier);

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          void api
            .createInvite({ resourceType: "team", resourceId: teamId, publicIdentifier, role: "member" })
            .then(async () => {
              setPublicIdentifier("");
              setFeedback("Convite enviado.");
              await refresh();
            })
            .catch((error: Error) => setFeedback(error.message));
        });
      }}
    >
      <Input
        aria-label="Identificador público"
        maxLength={7}
        placeholder="#331AF5"
        spellCheck={false}
        type="text"
        value={publicIdentifier}
        onChange={(event) => setPublicIdentifier(event.target.value.trim().toUpperCase())}
      />
      <Button disabled={isPending || !isValidIdentifier} type="submit">
        <Send size={18} />
        Convidar
      </Button>
    </form>
  );
}
