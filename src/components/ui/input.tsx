import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-stone-700/80 bg-stone-950/60 px-3 text-sm text-stone-50 shadow-inner outline-none transition placeholder:text-stone-500 hover:border-stone-600 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:bg-stone-800",
        className,
      )}
      {...props}
    />
  );
}
