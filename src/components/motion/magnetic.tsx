"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Pulls its child slightly toward the pointer, like the magnetic cards demo. */
export function Magnetic({
  children,
  strength = 8,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    element.style.setProperty("--magnet-x", `${x * strength}px`);
    element.style.setProperty("--magnet-y", `${y * strength}px`);
  }

  function reset() {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--magnet-x", "0px");
    element.style.setProperty("--magnet-y", "0px");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      className={cn("magnetic inline-flex", className)}
    >
      {children}
    </div>
  );
}
