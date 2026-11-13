import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const primaryClasses =
 "border border-amber-200/70 bg-amber-300 text-stone-950 hover:bg-amber-200";

const variants: Record<Variant, string> = {
  primary: primaryClasses,
  accent: primaryClasses,
  outline:
 "border border-stone-700 bg-stone-900/60 text-stone-50  hover:border-amber-400/50 hover:bg-stone-800/80 hover:text-amber-100",
  ghost: "text-stone-300 hover:bg-stone-800/70 hover:text-amber-100",
  danger:
 "border border-red-500/40 bg-red-600/90 text-white hover:bg-red-500",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
): string {
  return cn(
 "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
 "btn-sheen",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
