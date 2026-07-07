"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedFieldGrid({
  className,
  glowClassName
}: {
  className?: string;
  glowClassName?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div aria-hidden="true" className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
        <div className="field-grid-layer absolute inset-0 opacity-90" />
        <div className={clsx("field-grid-glow absolute inset-0", glowClassName)} />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="field-grid-layer absolute -inset-[12%] opacity-90"
        animate={{ x: [0, 20, 0], y: [0, 16, 0] }}
        transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className={clsx("field-grid-glow absolute inset-0", glowClassName)}
        animate={{ opacity: [0.7, 1, 0.75] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
    </div>
  );
}
