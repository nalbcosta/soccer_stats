import clsx from "clsx";
import type { AggregatedStats } from "@soccer-stats/shared";

const formCopy: Record<AggregatedStats["form"][number], { label: string; className: string }> = {
  W: {
    label: "V",
    className: "bg-success text-white"
  },
  D: {
    label: "E",
    className: "bg-warning-soft text-text"
  },
  L: {
    label: "D",
    className: "bg-error-soft text-error"
  }
};

export function FormDots({ form, limit = 5 }: { form: AggregatedStats["form"]; limit?: number }) {
  const recent = form.slice(-limit);

  if (recent.length === 0) {
    return <p className="text-xs font-bold text-muted">Sem sequencia ainda</p>;
  }

  return (
    <div className="flex items-center gap-1.5" aria-label="Forma recente">
      {recent.map((result, index) => {
        const copy = formCopy[result];

        return (
          <span
            className={clsx("grid h-6 w-6 place-items-center rounded-sm text-[11px] font-black", copy.className)}
            key={`${result}-${index}`}
            title={result === "W" ? "Vitoria" : result === "D" ? "Empate" : "Derrota"}
          >
            {copy.label}
          </span>
        );
      })}
    </div>
  );
}
