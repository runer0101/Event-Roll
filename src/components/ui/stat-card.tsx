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
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
        </div>
        <span
          className={
            accent
              ? "flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700"
              : "flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600"
          }
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </Card>
  );
}
