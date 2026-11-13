import { Card } from "@/components/ui/card";
import { SkeletonLines } from "@/components/ui/skeleton";

/**
 * Stands in for `src/app/dashboard/page.tsx` while the event list is read: the
 * same heading row with its "Nuevo evento" action, the four stat cards, the
 * two-column event grid and the door card at the bottom. Every shape borrows
 * the page's own paddings and radii, so nothing moves when the data lands.
 */
export default function DashboardLoading() {
  return (
    <div role="status" className="space-y-8">
      <span className="sr-only">Cargando…</span>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          {/* eyebrow, display heading, subtitle */}
          <div className="skeleton h-2.5 w-36" aria-hidden />
          <div className="skeleton h-10 w-56 sm:h-12 sm:w-64" aria-hidden />
          <div className="skeleton h-4 w-72 max-w-full" aria-hidden />
        </div>
        <div className="skeleton h-10 w-32 rounded-xl" aria-hidden />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Card key={index} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                {/* label, value, hint — the rhythm of a StatCard */}
                <div className="skeleton h-3 w-20" aria-hidden />
                <div className="skeleton mt-2 h-9 w-16" aria-hidden />
                <div className="skeleton mt-2 h-4 w-28" aria-hidden />
              </div>
              <div className="skeleton h-11 w-11 rounded-xl" aria-hidden />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="skeleton h-5 w-16 rounded-full"
                    aria-hidden
                  />
                  <div className="skeleton h-4 w-20" aria-hidden />
                </div>
                <div className="skeleton mt-3 h-8 w-3/4" aria-hidden />
                <div className="skeleton mt-1 h-5 w-1/2" aria-hidden />
              </div>
              <div className="skeleton h-6 w-6 shrink-0" aria-hidden />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className="skeleton h-4 w-28" aria-hidden />
                <div className="skeleton h-4 w-8" aria-hidden />
              </div>
              <div className="skeleton mt-2 h-2 w-full rounded-full" aria-hidden />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <div className="skeleton h-8 w-24 rounded-xl" aria-hidden />
              <div className="skeleton h-8 w-20 rounded-xl" aria-hidden />
              <div className="skeleton h-8 w-16 rounded-xl" aria-hidden />
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="skeleton h-10 w-10 shrink-0 rounded-xl" aria-hidden />
          <div className="w-80 max-w-full">
            <div className="skeleton h-4 w-2/3" aria-hidden />
            <SkeletonLines className="mt-1.5" lines={2} />
          </div>
        </div>
        <div className="skeleton h-8 w-40 shrink-0 rounded-xl" aria-hidden />
      </Card>
    </div>
  );
}
