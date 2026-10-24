import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <Card className="card-hover group relative overflow-hidden p-5">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400">
            {label}
          </p>
          <p className="mt-2 font-display text-4xl font-semibold leading-none tracking-tight text-stone-50">
            {value}
          </p>
          {hint && <p className="mt-2 text-xs text-stone-400">{hint}</p>}
        </div>
        <span
          className={
            accent
              ? "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-amber-300/25 to-amber-500/10 text-amber-200 ring-1 ring-amber-400/25"
              : "flex h-11 w-11 items-center justify-center rounded-xl bg-stone-800/70 text-stone-300 ring-1 ring-stone-700/80"
          }
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </Card>
  );
}
