import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ScanLine } from "lucide-react";
import { logout } from "@/actions/auth";
import { StaffConsole } from "@/components/staff-console";
import { StaffSchedule } from "@/components/staff-schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventCounters } from "@/lib/queries/events";
import { getRecentCheckInsForStaff } from "@/lib/queries/guests";
import { getScheduleForStaff } from "@/lib/queries/schedule";
import { getStaffForSession } from "@/lib/queries/staff";
import { roleLabel } from "@/lib/roles";
import { requireStaff } from "@/lib/session";
import { formatDate, formatTime } from "@/lib/utils";

export const metadata = { title: "Vista del equipo" };
export const dynamic = "force-dynamic";

export default async function StaffEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await requireStaff();
  const { eventId } = await params;
  const staff = await getStaffForSession(session.staffId);

  if (
    !staff ||
    !staff.active ||
    staff.eventId !== eventId ||
    staff.eventId !== session.eventId
  ) {
    redirect("/staff");
  }

  if (staff.event.status !== "ACTIVE") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
        <div className="max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-stone-50">
            Este evento está cerrado
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            El organizador cerró el check-in. Si crees que es un error, habla con
            el organizador del evento.
          </p>
        </div>
      </main>
    );
  }

  const schedule = await getScheduleForStaff(
    staff.id,
    staff.eventId,
    staff.organizationId,
  );

  const scheduleItems = schedule.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    startLabel: formatTime(item.startAt),
    status: item.status,
    assigneeName: staff.name,
    assigneeRole: roleLabel(staff.role),
  }));

  if (!staff.canCheckIn) {
    return (
      <div className="min-h-screen bg-stone-950">
        <header className="border-b border-stone-800 bg-stone-900">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-stone-950">
                <ScanLine className="h-4 w-4" aria-hidden />
              </span>
              <span className="hidden text-sm font-semibold text-stone-50 sm:block">
                Event-Roll
              </span>
            </Link>
            <div className="min-w-0 text-center">
              <p className="truncate text-sm font-semibold text-stone-50">
                {staff.event.name}
              </p>
              <p className="truncate text-xs text-stone-400">
                {formatDate(staff.event.date)} · {staff.event.location}
              </p>
            </div>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
          <div>
            <Badge variant="accent">{roleLabel(staff.role)}</Badge>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-50">
              Tu cronograma
            </h1>
            <p className="mt-1 text-sm text-stone-400">
              Hola, {staff.name}. Estas son las tareas que el organizador te
              asignó para este evento.
            </p>
          </div>

          <StaffSchedule items={scheduleItems} title="Tareas asignadas" />

          <p className="text-center text-xs text-stone-500">
            Marca cada tarea cuando esté lista. El organizador verá el avance en
            su panel.
          </p>
        </main>
      </div>
    );
  }

  const [recent, counters] = await Promise.all([
    getRecentCheckInsForStaff(
      staff.id,
      staff.eventId,
      staff.organizationId,
    ),
    staff.canViewStats
      ? getEventCounters(staff.eventId, staff.organizationId)
      : Promise.resolve(undefined),
  ]);

  return (
    <StaffConsole
      event={{
        id: staff.event.id,
        name: staff.event.name,
        dateLabel: formatDate(staff.event.date),
        location: staff.event.location,
      }}
      staff={{
        id: staff.id,
        name: staff.name,
        roleLabel: roleLabel(staff.role),
        canViewContact: staff.canViewContact,
        canEditGuests: staff.canEditGuests,
        canExport: staff.canExport,
        canUndoCheckIn: staff.canUndoCheckIn,
        canViewStats: staff.canViewStats,
      }}
      counters={
        counters
          ? {
              total: counters.total,
              checkedIn: counters.checkedIn,
              pending: counters.pending,
            }
          : undefined
      }
      initialRecent={recent.map((log) => ({
        id: log.id,
        guestName: log.guest.name,
        atLabel: formatTime(log.createdAt),
      }))}
      scheduleItems={scheduleItems}
    />
  );
}
