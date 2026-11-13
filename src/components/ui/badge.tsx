import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "muted";

/** Same meanings as before, now as a square tag: thin border, no ring. */
const variants: Record<BadgeVariant, string> = {
  accent: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  danger: "border-red-500/40 bg-red-500/10 text-red-200",
  muted: "border-stone-700 bg-stone-800/40 text-stone-300",
};

export function Badge({
  variant = "muted",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
 "inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
