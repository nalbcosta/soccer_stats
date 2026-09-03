"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useSession } from "../app/session-provider";
import { EmptyState } from "../feedback/empty-state";
import { LoadingState } from "../feedback/loading-state";
import { FormDots } from "../sports/form-dots";
import { Card } from "../ui/card";
import { useTranslations } from "../../i18n/provider";

export function TeamList() {
  const { dashboard } = useSession();
  const t = useTranslations("teams");

  if (!dashboard) {
    return <LoadingState label={t("loading")} />;
  }

  if (dashboard.teams.length === 0) {
    return <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {dashboard.teams.map((team) => (
        <Link href={`/app/teams/${team.slug}`} key={team.id}>
          <Card className="p-4 transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black">{team.name} <span className="font-mono text-xs text-primary-strong">{team.publicCode}</span></p>
                <p className="mt-1 text-sm text-muted">{team.members.length} {t("members")}</p>
              </div>
              <Users className="text-primary-strong" size={20} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini label="Pts" value={team.stats.points} />
              <Mini label={t("goals")} value={team.stats.goals} />
              <Mini label="Aprov." value={`${team.stats.winRate}%`} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-canvas p-3">
              <p className="text-xs font-black uppercase text-muted">{t("form")}</p>
              <FormDots form={team.stats.form} />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-canvas p-2">
      <p className="font-black">{value}</p>
      <p className="text-[11px] font-semibold text-muted">{label}</p>
    </div>
  );
}
