"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";

export function BottomSheet({
  open,
  title,
  description,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--modal-overlay)] md:grid md:place-items-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 h-full w-full cursor-default" type="button" aria-label="Fechar" onClick={onClose} />
      <section className="absolute inset-0 flex h-[100dvh] flex-col bg-surface shadow-panel md:relative md:inset-auto md:h-auto md:max-h-[86vh] md:w-full md:max-w-md md:rounded-lg">
        <header className="flex min-h-touch shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="font-black">{title}</p>
            {description ? <p className="mt-1 text-sm font-semibold text-muted">{description}</p> : null}
          </div>
          <Button className="min-h-9 px-2" type="button" variant="ghost" onClick={onClose} title="Fechar">
            <X size={19} />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{children}</div>
      </section>
    </div>
  );
}
