import { redirect } from "next/navigation";
import { StaffConsole } from "@/components/staff-console";
import { getEventCounters } from "@/lib/queries/events";
import { getRecentCheckInsForStaff } from "@/lib/queries/guests";
import { getStaffForSession } from "@/lib/queries/staff";
import { requireStaff } from "@/lib/session";
import { formatDate, formatTime } from "@/lib/utils";

export const metadata = { title: "Vista de guardia" };
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
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-stone-900">
            Este evento está cerrado
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            El organizador cerró el check-in. Si crees que es un error, habla con
            el organizador del evento.
          </p>
        </div>
      </main>
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
    />
  );
}
