import { Card } from "@/components/ui/card";

/**
 * Stands in for `src/app/dashboard/events/[eventId]/schedule/page.tsx`: the
 * heading and the schedule manager, which is the "add a task" card followed by
 * the list of task cards with their time, status badge, notes and assignee.
 */
export default function ScheduleLoading() {
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">Cargando…</span>

      <div>
        {/* "Cronograma del evento" and its explanation */}
        <div className="skeleton h-8 w-64" aria-hidden />
        <div className="mt-1 space-y-1.5">
          <div className="skeleton h-4 w-full max-w-3xl" aria-hidden />
          <div className="skeleton h-4 w-1/2 max-w-md" aria-hidden />
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-4 shrink-0" aria-hidden />
            <div className="skeleton h-4 w-56" aria-hidden />
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr_1fr]">
              {[0, 1, 2].map((field) => (
                <div key={field}>
                  <div className="skeleton h-4 w-20" aria-hidden />
                  <div
                    className="skeleton mt-1.5 h-10 w-full rounded-xl"
                    aria-hidden
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="skeleton h-4 w-32" aria-hidden />
              <div
                className="skeleton mt-1.5 h-16 w-full rounded-xl"
                aria-hidden
              />
            </div>

            <div className="flex justify-end">
              <div className="skeleton h-10 w-48 rounded-xl" aria-hidden />
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="skeleton mt-0.5 h-10 w-10 shrink-0 rounded-xl"
                    aria-hidden
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="skeleton h-4 w-16" aria-hidden />
                      <div
                        className="skeleton h-5 w-20 rounded-full"
                        aria-hidden
                      />
                    </div>
                    <div className="skeleton mt-1 h-4 w-48" aria-hidden />
                    <div className="skeleton mt-1.5 h-3 w-64" aria-hidden />
                    <div className="skeleton mt-1.5 h-3 w-40" aria-hidden />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="skeleton h-8 w-28 rounded-xl" aria-hidden />
                  <div className="skeleton h-8 w-8 rounded-xl" aria-hidden />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
