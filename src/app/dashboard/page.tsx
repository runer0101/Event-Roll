import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  DoorOpen,
  Plus,
  Ticket,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { getEventsForOwner } from "@/lib/queries/events";
import { requireOwner } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Panel" };

export default async function DashboardPage() {
  const owner = await requireOwner();
  const events = await getEventsForOwner(owner.organizationId);

  const now = new Date();
  const upcoming = events.filter((event) => event.date >= now);
  const totalGuests = events.reduce(
    (sum, event) => sum + event._count.guests,
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
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
            Panel del organizador
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-50">
            Tus eventos
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            Lista de invitados, equipo de puerta y accesos en vivo.
          </p>
        </div>
        <Link href="/dashboard/events/new" className={buttonClasses("accent")}>
          <Plus className="h-4 w-4" aria-hidden />
          Nuevo evento
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Eventos"
          value={events.length}
          hint={`${upcoming.length} próximos`}
          icon={CalendarDays}
        />
        <StatCard
          label="Invitados"
          value={totalGuests}
          hint="En todos tus eventos"
          icon={Users}
          accent
        />
        <StatCard
          label="Dentro"
          value={totalCheckedIn}
          hint="Check-ins registrados"
          icon={CheckCircle2}
        />
        <StatCard
          label="Equipo"
          value={events.reduce((sum, event) => sum + event._count.staff, 0)}
          hint="Ayudantes activos e inactivos"
          icon={DoorOpen}
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
              <Plus className="h-4 w-4" aria-hidden />
              Crear mi primer evento
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((event) => {
            const rate =
              event._count.guests === 0
                ? 0
                : Math.round((event.checkedIn / event._count.guests) * 100);
            return (
              <Card key={event.id} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          event.status === "ACTIVE" ? "success" : "muted"
                        }
                      >
                        {event.status === "ACTIVE" ? "Activo" : "Cerrado"}
                      </Badge>
                      <span className="text-xs text-stone-500">
                        {event._count.staff} ayudantes
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-xl font-semibold tracking-tight text-stone-50">
                      {event.name}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-400">
                      <CalendarDays className="h-4 w-4" aria-hidden />
                      {formatDate(event.date)} · {event.location}
                    </p>
                  </div>
                  <Ticket className="h-6 w-6 shrink-0 text-amber-400" aria-hidden />
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>
                      {event.checkedIn} de {event._count.guests} dentro
                    </span>
                    <span className="font-medium text-stone-200">{rate}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-400"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/events/${event.id}`}
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
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-800 text-stone-300">
            <DoorOpen className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-stone-50">
              ¿Ya tienes guardias en la puerta?
            </h2>
            <p className="mt-1 max-w-xl text-sm text-stone-400">
              Comparte el código único de cada ayudante. Entran en la vista de
              guardia, buscan al invitado y marcan la entrada; tú lo ves aquí en
              vivo.
            </p>
          </div>
        </div>
        <Link
          href="/staff"
          target="_blank"
          className={buttonClasses("outline", "sm", "shrink-0")}
        >
          Abrir vista de guardia
        </Link>
      </Card>
    </div>
  );
}
