"use client";

import { MailPlus } from "lucide-react";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { EmptyState } from "../feedback/empty-state";
import { LoadingState } from "../feedback/loading-state";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

export function InvitesPageContent() {
  const { dashboard } = useSession();

  if (!dashboard) {
    return <LoadingState label="Conferindo convites..." />;
  }

  return (
    <>
      <PageHeading eyebrow="Chamados" title="Convites" />
      {dashboard.invites.length === 0 ? (
        <EmptyState
          title="Nenhum convite pendente"
          description="Quando alguem chamar jogador, time ou copa, os convites aparecem aqui."
          actionHref="/app/teams"
          actionLabel="Ver times"
        />
      ) : (
        <div className="grid gap-3">
          {dashboard.invites.map((invite) => (
            <Card className="p-4" key={invite.id}>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary-strong">
                  <MailPlus size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black">{invite.email}</p>
                  <p className="mt-1 text-sm font-semibold text-muted">
                    {invite.resourceType === "team" ? "Convite para time" : "Convite para copa"} - papel {invite.role}
                  </p>
                </div>
                <Badge tone={invite.status === "pending" ? "warning" : invite.status === "accepted" ? "success" : "neutral"}>
                  {invite.status === "pending" ? "Pendente" : invite.status === "accepted" ? "Aceito" : "Revogado"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
