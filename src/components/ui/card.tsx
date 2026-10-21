import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-800 bg-stone-900 shadow-sm shadow-stone-900/[0.03]",
        className,
      )}
      {...props}
    />
  );
}
