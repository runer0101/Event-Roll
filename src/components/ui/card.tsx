import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * The panel the whole dashboard is built on: a flat surface and one hairline.
 * No blur, no shadow, no rounded shell — the landing set that register, and
 * every page consumes this component, so it carries here.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border border-stone-800 bg-stone-900/40", className)}
      {...props}
    />
  );
}
