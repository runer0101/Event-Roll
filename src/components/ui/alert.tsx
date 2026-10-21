import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "info" | "success" | "danger";

const variants: Record<Variant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  danger: "border-red-200 bg-red-50 text-red-800",
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
