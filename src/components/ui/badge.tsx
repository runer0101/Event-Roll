import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "muted";

const variants: Record<BadgeVariant, string> = {
  accent: "bg-amber-400/10 text-amber-300 ring-amber-400/30",
  success: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  danger: "bg-red-500/10 text-red-300 ring-red-500/30",
  muted: "bg-stone-800 text-stone-300 ring-stone-700",
};

export function Badge({
  variant = "muted",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
