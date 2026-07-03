"use client";

import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";

export function LocaleToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex gap-2">
      {(["pt-BR", "en"] as const).map((value) => (
        <Button
          key={value}
          type="button"
          variant={locale === value ? "primary" : "secondary"}
          className={compact ? "min-h-9 px-3 text-xs" : "min-w-20"}
          onClick={() => setLocale(value)}
        >
          {compact ? value.replace("pt-BR", "PT") : value}
        </Button>
      ))}
    </div>
  );
}
