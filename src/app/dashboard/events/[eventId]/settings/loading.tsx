import { Card } from "@/components/ui/card";

/**
 * Stands in for `src/app/dashboard/events/[eventId]/settings/page.tsx`: the
 * heading, the edit-event card with its name, date/place and description
 * fields, and the two danger-zone cards that close and delete the event.
 */
export default function EventSettingsLoading() {
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">Cargando…</span>

      <div>
        {/* "Ajustes del evento" and its explanation */}
        <div className="skeleton h-8 w-56" aria-hidden />
        <div className="skeleton mt-1 h-4 w-80 max-w-full" aria-hidden />
      </div>

      <Card className="p-6 sm:p-8">
        <div className="space-y-5">
          <div>
            <div className="skeleton h-4 w-36" aria-hidden />
            <div className="skeleton mt-1.5 h-10 w-full rounded-xl" aria-hidden />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((field) => (
              <div key={field}>
                <div className="skeleton h-4 w-24" aria-hidden />
                <div
                  className="skeleton mt-1.5 h-10 w-full rounded-xl"
                  aria-hidden
                />
              </div>
            ))}
          </div>

          <div>
            <div className="skeleton h-4 w-44" aria-hidden />
            <div
              className="skeleton mt-1.5 h-24 w-full rounded-xl"
              aria-hidden
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="skeleton h-12 w-40 rounded-xl" aria-hidden />
            <div className="skeleton h-4 w-64 max-w-full" aria-hidden />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {[0, 1].map((index) => (
          <Card key={index} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="w-96 max-w-full">
                <div className="skeleton h-4 w-40" aria-hidden />
                <div className="skeleton mt-1.5 h-4 w-full" aria-hidden />
                <div className="skeleton mt-1.5 h-4 w-2/3" aria-hidden />
              </div>
              <div className="skeleton h-8 w-32 shrink-0 rounded-xl" aria-hidden />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
