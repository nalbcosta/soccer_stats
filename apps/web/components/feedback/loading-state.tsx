import { SkeletonList } from "./skeleton-block";

export function LoadingState({ label = "Carregando vestiario..." }: { label?: string }) {
  return (
    <div className="grid min-h-[45vh] place-items-center px-4 text-center">
      <div>
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-muted">{label}</p>
      </div>
    </div>
  );
}

export function LoadingListState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <SkeletonList />
    </div>
  );
}
