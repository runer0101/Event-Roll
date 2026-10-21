import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border border-stone-700 bg-stone-900 px-3 text-sm text-stone-50 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
        className,
      )}
      {...props}
    />
  );
}
