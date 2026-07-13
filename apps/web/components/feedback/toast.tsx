"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import clsx from "clsx";
import { Button } from "../ui/button";
import { useTranslations } from "../../i18n/provider";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

const toastCopy: Record<ToastTone, { icon: typeof CheckCircle2; className: string }> = {
  success: { icon: CheckCircle2, className: "border-success-soft bg-surface text-success" },
  error: { icon: AlertCircle, className: "border-error-soft bg-surface text-error" },
  warning: { icon: TriangleAlert, className: "border-warning-soft bg-surface text-warning" },
  info: { icon: Info, className: "border-info-soft bg-surface text-info" }
};

export function ToastViewport({
  toast,
  onDismiss,
  duration = 3600
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
  duration?: number;
}) {
  const t = useTranslations("common");
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(onDismiss, duration);

    return () => window.clearTimeout(timeout);
  }, [duration, onDismiss, toast]);

  if (!toast) {
    return null;
  }

  const copy = toastCopy[toast.tone];
  const Icon = copy.icon;

  return (
    <div className="fixed inset-x-3 bottom-[calc(var(--nav-height)+12px)] z-[70] md:bottom-5 md:left-auto md:right-5 md:w-[360px]">
      <div
        className={clsx(
          "flex items-start gap-3 rounded-lg border p-3 text-sm shadow-panel",
          copy.className
        )}
        role="status"
      >
        <Icon className="mt-0.5 shrink-0" size={18} />
        <p className="min-w-0 flex-1 font-semibold text-text">{toast.message}</p>
        <Button className="min-h-7 px-1.5" type="button" variant="ghost" onClick={onDismiss} title={t("close")}>
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
