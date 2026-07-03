"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function MenuShell({
  open,
  onClose,
  children,
  mobileFullScreen = false
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  mobileFullScreen?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

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
    <Overlay onClose={onClose}>
      <div
        className={clsx(
          "absolute flex flex-col overflow-hidden bg-surface shadow-panel",
          mobileFullScreen
            ? "inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom))] rounded-none border-y border-border md:absolute md:right-6 md:top-20 md:bottom-auto md:w-[min(92vw,360px)] md:rounded-lg md:border"
            : "right-4 top-20 w-[min(92vw,360px)] rounded-lg border border-border md:right-6"
        )}
        onPointerDown={(event) => event.stopPropagation()}
        role="menu"
      >
        {children}
      </div>
    </Overlay>,
    document.body
  );
}

function Overlay({
  children,
  onClose
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60]" onPointerDown={onClose} role="presentation">
      {children}
    </div>
  );
}
