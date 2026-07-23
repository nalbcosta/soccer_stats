"use client";

import { SkeletonList } from "./skeleton-block";
import { useTranslations } from "../../i18n/provider";

export function LoadingState({ label = "Carregando vestiário..." }: { label?: string }) {
  const t = useTranslations("feedback");
  return (
    <div className="grid min-h-[45vh] place-items-center px-4 text-center">
      <div>
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-muted">{label === "Carregando vestiário..." ? t("loadingLockerRoom") : label}</p>
      </div>
    </div>
  );
}

export function LoadingListState({ label = "Carregando..." }: { label?: string }) {
  const t = useTranslations("feedback");
  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold text-muted">{label === "Carregando..." ? t("loading") : label}</p>
      <SkeletonList />
    </div>
  );
}
