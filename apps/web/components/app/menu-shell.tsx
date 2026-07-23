"use client";

import clsx from "clsx";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

type MenuPositionStyle = React.CSSProperties & {
  "--menu-top"?: string;
  "--menu-right"?: string;
};

export function MenuShell({
  open,
  onClose,
  children,
  mobileFullScreen = false,
  anchorRef
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  mobileFullScreen?: boolean;
  anchorRef?: React.RefObject<HTMLElement | null>;
}) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPositionStyle>({});

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) {
      return;
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setPosition({
        "--menu-top": `${Math.ceil(rect.bottom + 8)}px`,
        "--menu-right": `${Math.max(12, window.innerWidth - Math.ceil(rect.right))}px`
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => window.removeEventListener("resize", updatePosition);
  }, [anchorRef, open]);

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
            ? "inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom))] rounded-none border-y border-border md:bottom-auto md:left-auto md:w-[min(92vw,360px)] md:rounded-lg md:border md:top-[var(--menu-top)] md:right-[var(--menu-right)]"
            : "right-4 top-20 w-[min(92vw,360px)] rounded-lg border border-border md:top-[var(--menu-top)] md:right-[var(--menu-right)]"
        )}
        style={position}
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
