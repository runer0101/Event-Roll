import { Card } from "@/components/ui/card";
import { SkeletonLines } from "@/components/ui/skeleton";

/**
 * Stands in for `src/app/dashboard/events/[eventId]/page.tsx`. The event
 * header and the tab bar belong to the segment layout and are already on
 * screen, so this mirrors only the page body: the live panel (title, four
 * counters, progress bar, recent movements and staff activity) and the
 * "share the access" card with its five shortcuts.
 */
export default function EventOverviewLoading() {
  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Cargando…</span>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {/* "Accesos en vivo" and its caption */}
            <div className="skeleton h-8 w-52" aria-hidden />
            <div className="skeleton mt-1 h-4 w-64 max-w-full" aria-hidden />
          </div>
          <div className="skeleton h-6 w-24 rounded-full" aria-hidden />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Card key={index} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="skeleton h-3 w-20" aria-hidden />
                  <div className="skeleton mt-2 h-9 w-16" aria-hidden />
                  <div className="skeleton mt-2 h-4 w-28" aria-hidden />
                </div>
                <div className="skeleton h-11 w-11 rounded-xl" aria-hidden />
              </div>
            </Card>
          ))}
        </div>

        <div className="skeleton h-2.5 w-full rounded-full" aria-hidden />

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          {[0, 1].map((index) => (
            <Card key={index} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-800 px-5 py-4">
                <div className="skeleton h-4 w-40" aria-hidden />
                <div className="skeleton h-4 w-20" aria-hidden />
              </div>
              <div className="divide-y divide-stone-800">
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center gap-3 px-5 py-3.5">
                    <div
                      className="skeleton h-9 w-9 shrink-0 rounded-full"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="skeleton h-4 w-1/2" aria-hidden />
                      <div className="skeleton mt-1.5 h-3 w-2/3" aria-hidden />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="skeleton h-10 w-10 shrink-0 rounded-xl" aria-hidden />
            <div className="w-96 max-w-full">
              <div className="skeleton h-4 w-2/3" aria-hidden />
              <SkeletonLines className="mt-1.5" lines={2} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="skeleton h-8 w-32 rounded-xl" aria-hidden />
            <div className="skeleton h-8 w-36 rounded-xl" aria-hidden />
          </div>
        </div>

        <div className="mt-5 grid gap-2 border-t border-stone-800/70 pt-5 sm:grid-cols-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="skeleton h-10 rounded-xl"
              aria-hidden
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
