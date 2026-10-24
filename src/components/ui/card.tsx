import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-800/80 bg-stone-900/60 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_18px_40px_-32px_rgba(0,0,0,0.9)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
