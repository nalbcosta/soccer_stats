"use client";

import { MapPin, Users } from "lucide-react";
import { useTeamDiscovery } from "../../composables/use-team-discovery";
import { useTeamMembership } from "../../composables/use-team-membership";
import { useTranslations } from "../../i18n/provider";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { EmptyState } from "../feedback/empty-state";
import { LoadingState } from "../feedback/loading-state";

export function TeamDiscovery() {
  const { teams, loading, error, reload } = useTeamDiscovery();
  const { pendingTeamId, requestJoin } = useTeamMembership();
  const t = useTranslations("teams");

  if (loading) return <LoadingState label={t("discoveryLoading")} />;
  if (error) return <div className="space-y-3"><EmptyState title={t("discoveryError")} description={error} /><Button onClick={() => void reload()}>{t("tryAgain")}</Button></div>;
  if (!teams.length) return <EmptyState title={t("discoveryEmptyTitle")} description={t("discoveryEmptyDescription")} />;

  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{teams.map((team) => <Card className="p-4" key={team.id}>
    <div className="flex items-start gap-3">
      <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground">{team.logoUrl ? <img alt="" className="size-full object-cover" src={team.logoUrl} /> : <Users size={20} />}</div>
      <div className="min-w-0"><p className="truncate font-black">{team.name}</p><p className="mt-1 text-sm text-muted">{team.members.length} {t("members")}</p>{team.city && <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={13} />{team.city}{team.state ? `, ${team.state}` : ""}</p>}</div>
    </div>
    {team.description && <p className="mt-3 line-clamp-2 text-sm text-muted">{team.description}</p>}
    <Button className="mt-4 w-full" disabled={pendingTeamId === team.id} onClick={() => void requestJoin(team.id)}>{pendingTeamId === team.id ? t("requesting") : t("requestJoin")}</Button>
  </Card>)}</div>;
}
