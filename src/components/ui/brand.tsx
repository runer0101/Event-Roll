import { NerdGlyph } from "@/components/ui/nerd-glyph";
import { cn } from "@/lib/utils";

type BrandSize = "sm" | "md";

const sizes: Record<
  BrandSize,
  { mark: string; glyph: string; wordmark: string }
> = {
  sm: {
    mark: "h-8 w-8 rounded-lg",
    glyph: "text-[1.05rem]",
    wordmark: "text-lg",
  },
  md: {
    mark: "h-9 w-9 rounded-xl",
    glyph: "text-[1.2rem]",
    wordmark: "text-xl",
  },
};

/**
 * The Event-Roll lockup: the amber ticket mark, the wordmark and its amber
 * period. Presentational only, so every site keeps its own link and layout and
 * asks for the wordmark visibility it needs through `wordmarkClassName`.
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
  const { mark, glyph, wordmark } = sizes[size];

  return (
    <span className={cn("group flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex items-center justify-center border border-amber-300/40 bg-gradient-to-b from-amber-200 to-amber-500 text-stone-950 shadow-[0_8px_24px_-12px_rgba(212,175,55,0.8)] transition-transform duration-500 group-hover:rotate-3",
          mark,
        )}
      >
        <NerdGlyph name="ticket" className={glyph} />
      </span>
      <span
        className={cn(
          "font-display font-semibold tracking-tight text-stone-50",
          wordmark,
          wordmarkClassName,
        )}
      >
        Event-Roll<span className="text-amber-400">.</span>
        {tagline ? <span className="text-stone-400"> · {tagline}</span> : null}
      </span>
    </span>
  );
}
