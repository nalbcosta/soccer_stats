"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

export function UserAvatar({
  alt,
  initials,
  src,
  className
}: {
  alt: string;
  initials: string;
  src?: string | null;
  className?: string;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");

  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  return (
    <span className={clsx("relative grid shrink-0 place-items-center overflow-hidden rounded-lg bg-field text-xs font-black text-white shadow-line", className)}>
      <span aria-hidden="true" className="absolute inset-0 grid place-items-center">{initials}</span>
      {src ? (
        <img
          alt={alt}
          className={clsx("absolute inset-0 h-full w-full object-cover transition-opacity duration-200", status === "loaded" ? "opacity-100" : "opacity-0")}
          decoding="async"
          height={48}
          loading="lazy"
          src={src}
          width={48}
          onError={() => setStatus("error")}
          onLoad={() => setStatus("loaded")}
        />
      ) : null}
    </span>
  );
}
