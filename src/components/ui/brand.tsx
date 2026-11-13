import { cn } from "@/lib/utils";

type BrandSize = "sm" | "md";

const sizes: Record<BrandSize, { wordmark: string }> = {
  sm: { wordmark: "text-lg" },
  md: { wordmark: "text-xl" },
};

/**
 * The Event-Roll wordmark: type only, no mark, no glyph. Presentational only, so
 * every site keeps its own link and layout and asks for the wordmark size it
 * needs through `wordmarkClassName`.
 */
export function Brand({
  size = "md",
  tagline,
  className,
  wordmarkClassName,
}: {
  size?: BrandSize;
  tagline?: string;
  className?: string;
  wordmarkClassName?: string;
}) {
  const { wordmark } = sizes[size];

  return (
    <span className={cn("group flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "font-display font-semibold tracking-tight text-stone-50",
          wordmark,
          wordmarkClassName,
        )}
      >
        Event-Roll<span className="text-stone-500">.</span>
        {tagline ? <span className="text-stone-400"> · {tagline}</span> : null}
      </span>
    </span>
  );
}
