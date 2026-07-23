"use client";

import { MailPlus } from "lucide-react";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { EmptyState } from "../feedback/empty-state";
import { LoadingState } from "../feedback/loading-state";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { useTranslations } from "../../i18n/provider";

export function InvitesPageContent() {
  const { dashboard } = useSession();
  const t = useTranslations("invites");

  if (!dashboard) {
    return <LoadingState label={t("loading")} />;
  }

  return (
    <>
      <PageHeading eyebrow={t("eyebrow")} title={t("title")} />
      {dashboard.invites.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actionHref="/app/teams"
          actionLabel={t("viewTeams")}
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
                    {invite.resourceType === "team" ? t("teamInvitation") : t("tournamentInvitation")} - {t("role", { role: invite.role })}
                  </p>
                </div>
                <Badge tone={invite.status === "pending" ? "warning" : invite.status === "accepted" ? "success" : "neutral"}>
                  {invite.status === "pending" ? t("pending") : invite.status === "accepted" ? t("accepted") : t("revoked")}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
