import { Card } from "@/components/ui/card";

/**
 * Stands in for `src/app/dashboard/events/[eventId]/tables/page.tsx`: the
 * heading, the "new table" form card, and the seating board with its four
 * counters, its legend and the table cards whose chairs are square buttons.
 */
export default function TablesLoading() {
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">Cargando…</span>

      <div>
        {/* "Mesas y sillas" and its three-line explanation */}
        <div className="skeleton h-8 w-56" aria-hidden />
        <div className="mt-1 space-y-1.5">
          <div className="skeleton h-4 w-full max-w-3xl" aria-hidden />
          <div className="skeleton h-4 w-full max-w-2xl" aria-hidden />
          <div className="skeleton h-4 w-1/2 max-w-md" aria-hidden />
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <div className="skeleton h-4 w-24" aria-hidden />
            <div className="skeleton mt-1.5 h-10 w-full rounded-xl" aria-hidden />
          </div>
          <div className="w-full sm:w-32">
            <div className="skeleton h-4 w-14" aria-hidden />
            <div className="skeleton mt-1.5 h-10 w-full rounded-xl" aria-hidden />
          </div>
          <div className="skeleton h-10 w-28 rounded-xl" aria-hidden />
        </div>
      </Card>

      <div className="space-y-6">
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

        <div className="flex flex-wrap items-center gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className="skeleton h-3 w-3" aria-hidden />
              <div className="skeleton h-3 w-16" aria-hidden />
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-stone-800 px-4 py-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="skeleton h-4 w-20" aria-hidden />
                    <div
                      className="skeleton h-5 w-20 rounded-full"
                      aria-hidden
                    />
                  </div>
                  <div className="skeleton mt-1 h-3 w-32" aria-hidden />
                </div>
                <div className="flex items-center gap-1">
                  <div className="skeleton h-8 w-8 rounded-xl" aria-hidden />
                  <div className="skeleton h-8 w-8 rounded-xl" aria-hidden />
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((chair) => (
                    <div
                      key={chair}
                      className="skeleton aspect-square rounded-lg"
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
