"use client";

import type { PaginationMeta } from "../../lib/api";
import { Button } from "../ui/button";
import { useTranslations } from "../../i18n/provider";

export function MatchPagination({
  pagination,
  onPageChange
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("feedback");
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3 text-sm font-semibold text-muted shadow-line">
      <Button
        className="min-h-10 px-3"
        disabled={pagination.page <= 1}
        type="button"
        variant="secondary"
        onClick={() => onPageChange(pagination.page - 1)}
      >
        {t("previous")}
      </Button>
      <span>
        {t("page", { page: pagination.page, total: pagination.totalPages })}
      </span>
      <Button
        className="min-h-10 px-3"
        disabled={pagination.page >= pagination.totalPages}
        type="button"
        variant="secondary"
        onClick={() => onPageChange(pagination.page + 1)}
      >
        {t("next")}
      </Button>
    </div>
  );
}
