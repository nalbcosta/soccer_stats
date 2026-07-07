"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

type LazyImageStatus = "idle" | "loading" | "loaded" | "error";

export function LazyImage({
  src,
  alt,
  className,
  imageClassName,
  loadingClassName,
  fallback,
  objectPosition = "center",
  onStatusChange
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  loadingClassName?: string;
  fallback?: React.ReactNode;
  objectPosition?: string;
  onStatusChange?: (status: LazyImageStatus) => void;
}) {
  const [status, setStatus] = useState<LazyImageStatus>(src ? "loading" : "error");

  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  return (
    <div className={clsx("relative h-full w-full overflow-hidden", className)}>
      {status !== "loaded" ? (
        <div className={clsx("absolute inset-0 bg-canvas/70", loadingClassName)} />
      ) : null}

      {src ? (
        <img
          alt={alt}
          className={clsx(
            "absolute inset-0 block h-full w-full object-cover transition-opacity duration-500",
            status === "error" ? "opacity-0" : "opacity-100",
            imageClassName
          )}
          decoding="async"
          loading="lazy"
          onError={() => setStatus("error")}
          onLoad={() => setStatus("loaded")}
          src={src}
          style={{ objectPosition }}
        />
      ) : null}

      {status === "error" && fallback ? <div className="absolute inset-0">{fallback}</div> : null}
    </div>
  );
}
