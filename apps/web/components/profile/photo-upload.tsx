"use client";

import { FileImage, FolderOpen, ImagePlus, Upload } from "lucide-react";
import { useId, useState } from "react";
import { useTranslations } from "../../i18n/provider";
import clsx from "clsx";

export function PhotoUpload({
  hasPhoto,
  fileName,
  onFile,
  className,
  labelClassName
}: {
  hasPhoto: boolean;
  fileName?: string;
  onFile: (file: File | null) => void;
  className?: string;
  labelClassName?: string;
}) {
  const t = useTranslations("profile");
  const [isDragging, setIsDragging] = useState(false);

  const acceptFile = (file: File | null) => {
    setIsDragging(false);
    onFile(file);
  };

  return (
    <div
      className={clsx(
        "w-full rounded-xl border border-dashed p-2 transition",
        isDragging ? "border-primary bg-primary-soft/50" : "border-border bg-canvas",
        className
      )}
      onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
      onDrop={(event) => { event.preventDefault(); acceptFile(event.dataTransfer.files?.[0] ?? null); }}
    >
      <label className={clsx("flex min-h-16 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-surface focus-within:ring-2 focus-within:ring-primary", labelClassName)} htmlFor="profile-photo-upload">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-strong">
          {fileName ? <FileImage size={19} /> : hasPhoto ? <ImagePlus size={19} /> : <Upload size={19} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-text">{fileName ?? (hasPhoto ? t("photoChange") : t("photoChoose"))}</span>
          <span className="mt-0.5 block text-xs text-muted">{t("photoFormats")}</span>
        </span>
        <span aria-label={t("photoBrowse")} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-surface text-text sm:flex sm:h-auto sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-xs">
          <FolderOpen size={16} />
          <span className="hidden sm:inline">{t("photoBrowse")}</span>
        </span>
      </label>
      <input
        id="profile-photo-upload"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        type="file"
        onChange={(event) => {
          acceptFile(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}

export function PhotoDropSurface({ children, onFile, showHover = true }: { children: React.ReactNode; onFile: (file: File | null) => void; showHover?: boolean }) {
  const t = useTranslations("profile");
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();

  return (
    <div
      className="group relative"
      onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setIsDragging(false); onFile(event.dataTransfer.files?.[0] ?? null); }}
    >
      {children}
      <label className="absolute bottom-3 left-3 z-20 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-black/45 px-3 text-sm font-bold text-white shadow-line backdrop-blur transition hover:bg-black/60 focus-within:ring-2 focus-within:ring-primary" htmlFor={inputId}>
        <FolderOpen size={17} />
        <span>{t("photoBrowse")}</span>
      </label>
      <input
        id={inputId}
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        type="file"
        onChange={(event) => {
          onFile(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />
      <div className={clsx("pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-xl bg-black/45 opacity-0 transition-opacity", showHover && "group-hover:opacity-100", isDragging && "opacity-100")}>
        <span className="rounded-lg bg-surface/95 px-4 py-2 text-sm font-bold text-text shadow-panel">
          {isDragging ? t("photoDropActive") : t("photoHover")}
        </span>
      </div>
    </div>
  );
}
