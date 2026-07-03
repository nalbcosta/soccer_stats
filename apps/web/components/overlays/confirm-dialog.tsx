"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "../ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Voltar",
  tone = "warning",
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "warning" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[var(--modal-overlay)] px-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Fechar" onClick={onClose} />
      <section className="relative w-full max-w-sm rounded-lg border border-border bg-surface p-4 shadow-panel">
        <div className="flex items-start gap-3">
          <div className={tone === "danger" ? "text-error" : "text-warning"}>
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black">{title}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{description}</p>
          </div>
          <Button className="min-h-8 px-2" type="button" variant="ghost" onClick={onClose} title="Fechar">
            <X size={17} />
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="button" className={tone === "danger" ? "bg-error hover:bg-error" : undefined} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>,
    document.body
  );
}
