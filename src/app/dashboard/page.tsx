import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { getEventsForOwner, progressRate } from "@/lib/queries/events";
import { requireOwner } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Panel" };

export default async function DashboardPage() {
  const owner = await requireOwner();
  const events = await getEventsForOwner(owner.organizationId);

  const now = new Date();
  const upcoming = events.filter((event) => event.date >= now);
  const totalGuests = events.reduce(
    (sum, event) => sum + event.countedGuests,
    0,
  );
  const totalCheckedIn = events.reduce(
    (sum, event) => sum + event.checkedIn,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
            Panel del organizador
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-5xl">
            Tus eventos
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            Lista de invitados, equipo de puerta y accesos en vivo.
          </p>
        </div>
        <Link href="/dashboard/events/new" className={buttonClasses("accent")}>
          Nuevo evento
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Eventos"
          value={events.length}
          hint={`${upcoming.length} próximos`}
        />
        <StatCard
          label="Invitados"
          value={totalGuests}
          hint="En todos tus eventos"
          accent
        />
        <StatCard
          label="Dentro"
          value={totalCheckedIn}
          hint="Check-ins registrados"
        />
        <StatCard
          label="Equipo"
          value={events.reduce((sum, event) => sum + event._count.staff, 0)}
          hint="Ayudantes activos e inactivos"
        />
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="Todavía no tienes eventos"
          description="Crea el primero, importa la lista de invitados y comparte un código con tu equipo de puerta."
          action={
            <Link
              href="/dashboard/events/new"
              className={buttonClasses("primary")}
            >
              Crear mi primer evento
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((event) => {
            // Same denominator as the live panel and the guard counters:
            // cancelled invitations are not part of the progress.
            const rate = progressRate(event.checkedIn, event.countedGuests);
            return (
              <Card key={event.id} className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={event.status === "ACTIVE" ? "success" : "muted"}
                  >
                    {event.status === "ACTIVE" ? "Activo" : "Cerrado"}
                  </Badge>
                  <span className="text-xs text-stone-500">
                    {event._count.staff} ayudantes
                  </span>
                </div>
                <h2 className="mt-3 truncate font-display text-2xl font-medium tracking-tight text-stone-50">
                  {event.name}
                </h2>
                <p className="mt-1 text-sm text-stone-400">
                  {formatDate(event.date)} · {event.location}
                </p>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>
                      {event.checkedIn} de {event.countedGuests} dentro
                    </span>
                    <span className="font-medium tabular-nums text-stone-200">
                      {rate}%
                    </span>
                  </div>
                  <div className="mt-2 h-px bg-stone-800">
                    <div
                      className="h-px bg-amber-400"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    aria-label={`Abrir panel de ${event.name}`}
                    className={buttonClasses("primary", "sm")}
                  >
                    Abrir panel
                  </Link>
                  <Link
                    href={`/dashboard/events/${event.id}/guests`}
                    className={buttonClasses("outline", "sm")}
                  >
                    Invitados
                  </Link>
                  <Link
                    href={`/dashboard/events/${event.id}/staff`}
                    className={buttonClasses("ghost", "sm")}
                  >
                    Equipo
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-semibold text-stone-50">
            ¿Ya tienes asistentes en la puerta?
          </h2>
          <p className="mt-1 max-w-xl text-sm text-stone-400">
            Comparte el código único de cada ayudante. Entran en la vista de
            asistente, buscan al invitado y marcan la entrada; tú lo ves aquí en
            vivo.
          </p>
        </div>
        <Link
          href="/staff"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("outline", "sm", "shrink-0")}
        >
          Abrir vista de asistente
        </Link>
      </Card>
    </div>
  );
}
