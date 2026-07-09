"use client";

import type { PaginationMeta } from "../../lib/api";
import { Button } from "../ui/button";

export function MatchPagination({
  pagination,
  onPageChange
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
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
        Anterior
      </Button>
      <span>
        Página {pagination.page} de {pagination.totalPages}
      </span>
      <Button
        className="min-h-10 px-3"
        disabled={pagination.page >= pagination.totalPages}
        type="button"
        variant="secondary"
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Próxima
      </Button>
    </div>
  );
}
