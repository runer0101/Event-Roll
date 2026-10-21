import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "info" | "success" | "danger";

const variants: Record<Variant, string> = {
  info: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function Alert({
  variant = "info",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
