import { cn } from "@/lib/utils";

/**
 * Placeholder that keeps the final layout while data loads, so a page never
 * jumps from blank to full. Composed here instead of per page so every route
 * shows the same rhythm.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 w-full", className)} aria-hidden />;
}

/** A block of stacked lines; the last one is shorter, as text actually ends. */
export function SkeletonLines({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn("skeleton h-3", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Card-shaped placeholder with the app's own radius and border. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
 " border border-stone-800/60 bg-stone-900/40 p-5",
        className,
      )}
      aria-hidden
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-32" />
      <SkeletonLines className="mt-4" lines={2} />
    </div>
  );
}
