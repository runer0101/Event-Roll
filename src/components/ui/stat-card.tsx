import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A number, its label and a hairline: no tile, no icon, no lift. The callers
 * that still pass `icon` keep compiling; nothing is drawn for it.
 */
export function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className="border-t border-stone-800 pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">
        {label}
      </p>
      <p
        className={cn(
 "mt-2 font-display text-3xl font-semibold leading-none tracking-tight tabular-nums",
          accent ? "text-amber-300" : "text-stone-50",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}
