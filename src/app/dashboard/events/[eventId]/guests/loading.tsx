import { Card } from "@/components/ui/card";

/** The seven columns of the guest table, weighed like the real ones. */
const GUEST_COLUMNS =
  "grid grid-cols-[2fr_2fr_1.2fr_1fr_1.2fr_1.6fr_1fr] items-start gap-4 px-4 py-3";

/**
 * Stands in for `src/app/dashboard/events/[eventId]/guests/page.tsx`: the
 * title with its export/import/add actions, the filter card, and the table
 * with its empty-state-free body and pagination footer. Row heights follow the
 * two-line guest cell so the table does not grow when the names arrive.
 */
export default function GuestsLoading() {
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">Cargando…</span>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {/* "Lista de invitados" and the running count */}
          <div className="skeleton h-8 w-48" aria-hidden />
          <div className="skeleton mt-1 h-4 w-40" aria-hidden />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="skeleton h-8 w-28 rounded-xl" aria-hidden />
          <div className="skeleton h-8 w-32 rounded-xl" aria-hidden />
          <div className="skeleton h-8 w-36 rounded-xl" aria-hidden />
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="skeleton h-10 min-w-64 flex-1 rounded-xl" aria-hidden />
          <div className="skeleton h-10 w-40 rounded-xl" aria-hidden />
          <div className="skeleton h-10 w-20 rounded-xl" aria-hidden />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div
              className={`${GUEST_COLUMNS} border-b border-stone-800/80 bg-stone-900/50`}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((column) => (
                <div key={column} className="skeleton h-2.5 w-full" aria-hidden />
              ))}
            </div>

            <div className="divide-y divide-stone-800">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
                <div key={row} className={GUEST_COLUMNS}>
                  {/* guest: name over code */}
                  <div>
                    <div className="skeleton h-4 w-3/4" aria-hidden />
                    <div className="skeleton mt-1.5 h-3 w-1/2" aria-hidden />
                  </div>
                  {/* contact */}
                  <div>
                    <div className="skeleton h-3 w-4/5" aria-hidden />
                    <div className="skeleton mt-1 h-3 w-1/2" aria-hidden />
                  </div>
                  {/* category */}
                  <div className="skeleton h-3 w-2/3" aria-hidden />
                  {/* plus ones */}
                  <div className="skeleton h-3 w-8" aria-hidden />
                  {/* status badge */}
                  <div className="skeleton h-5 w-20 rounded-full" aria-hidden />
                  {/* check-in time */}
                  <div>
                    <div className="skeleton h-3 w-3/4" aria-hidden />
                    <div className="skeleton mt-1 h-3 w-1/2" aria-hidden />
                  </div>
                  {/* actions */}
                  <div className="skeleton ml-auto h-4 w-12" aria-hidden />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-800 px-4 py-3">
          <div className="skeleton h-4 w-32" aria-hidden />
          <div className="flex items-center gap-2">
            <div className="skeleton h-8 w-20 rounded-xl" aria-hidden />
            <div className="skeleton h-8 w-20 rounded-xl" aria-hidden />
          </div>
        </div>
      </Card>

      <div className="skeleton h-3.5 w-80 max-w-full" aria-hidden />
    </div>
  );
}
