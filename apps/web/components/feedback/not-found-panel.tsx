import Link from "next/link";
import { CircleOff } from "lucide-react";

export function NotFoundPanel({
  title,
  backHref
}: {
  title: string;
  backHref: string;
}) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="rounded-lg border border-border bg-surface p-6 shadow-line">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-error-soft text-error">
          <CircleOff size={21} />
        </div>
        <p className="text-lg font-bold">{title}</p>
        <p className="mt-2 text-sm text-muted">Esse registro nao apareceu no seu vestiario.</p>
        <Link className="mt-5 inline-flex text-sm font-semibold text-primary-strong" href={backHref}>
          Voltar
        </Link>
      </div>
    </div>
  );
}
