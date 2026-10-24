import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "border border-amber-300/60 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 text-stone-950 shadow-[0_10px_30px_-14px_rgba(212,175,55,0.65)] hover:from-amber-100 hover:via-amber-200 hover:to-amber-400",
  accent:
    "border border-amber-300/60 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 text-stone-950 shadow-[0_10px_30px_-14px_rgba(212,175,55,0.65)] hover:from-amber-100 hover:via-amber-200 hover:to-amber-400",
  outline:
    "border border-stone-700 bg-stone-900/60 text-stone-50 backdrop-blur-sm hover:border-amber-400/50 hover:bg-stone-800/80 hover:text-amber-100",
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
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
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
