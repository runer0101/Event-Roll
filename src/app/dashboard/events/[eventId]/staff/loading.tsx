import { Card } from "@/components/ui/card";

/**
 * Stands in for `src/app/dashboard/events/[eventId]/staff/page.tsx`: the title
 * with the "create code" action, the one-code-one-guard explainer band, and the
 * two-column grid of staff cards with their name/role fields, permission
 * checkboxes and action row.
 */
export default function StaffLoading() {
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">Cargando…</span>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {/* "Equipo de puerta" and its explanation */}
          <div className="skeleton h-8 w-52" aria-hidden />
          <div className="skeleton mt-1 h-4 w-96 max-w-full" aria-hidden />
        </div>
        <div className="skeleton h-10 w-40 rounded-xl" aria-hidden />
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="skeleton h-10 w-10 shrink-0 rounded-xl" aria-hidden />
            <div className="w-96 max-w-full">
              <div className="skeleton h-4 w-1/2" aria-hidden />
              <div className="skeleton mt-1.5 h-4 w-full" aria-hidden />
              <div className="skeleton mt-1.5 h-4 w-2/3" aria-hidden />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-4 shrink-0" aria-hidden />
            <div className="skeleton h-3 w-40" aria-hidden />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((index) => (
          <Card key={index} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="skeleton h-5 w-32" aria-hidden />
                  <div
                    className="skeleton h-5 w-20 rounded-full"
                    aria-hidden
                  />
                  <div
                    className="skeleton h-5 w-16 rounded-full"
                    aria-hidden
                  />
                </div>
                <div className="skeleton mt-1.5 h-3 w-56" aria-hidden />
              </div>
              <div className="flex items-center gap-2">
                <div className="skeleton h-6 w-24 rounded-lg" aria-hidden />
                <div className="skeleton h-8 w-8 rounded-xl" aria-hidden />
                <div className="skeleton h-8 w-8 rounded-xl" aria-hidden />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1].map((field) => (
                  <div key={field}>
                    <div className="skeleton h-4 w-20" aria-hidden />
                    <div
                      className="skeleton mt-1.5 h-10 w-full rounded-xl"
                      aria-hidden
                    />
                  </div>
                ))}
              </div>

              <div className="skeleton h-12 rounded-lg" aria-hidden />

              <div>
                <div className="skeleton h-3 w-24" aria-hidden />
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {[0, 1, 2, 3, 4].map((permission) => (
                    <div
                      key={permission}
                      className="skeleton h-9 rounded-lg"
                      aria-hidden
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="skeleton h-8 w-32 rounded-xl" aria-hidden />
                <div className="skeleton h-8 w-24 rounded-xl" aria-hidden />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="skeleton h-3.5 w-80 max-w-full" aria-hidden />
    </div>
  );
}
