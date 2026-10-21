import { notFound } from "next/navigation";
import { ScheduleManager } from "@/components/schedule-manager";
import { getEventForOwner } from "@/lib/queries/events";
import { getScheduleForEvent } from "@/lib/queries/schedule";
import { getStaffForEvent } from "@/lib/queries/staff";
import { roleLabel } from "@/lib/roles";
import { requireOwner } from "@/lib/session";
import { formatTime } from "@/lib/utils";

export const metadata = { title: "Cronograma" };
export const dynamic = "force-dynamic";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const owner = await requireOwner();
  const { eventId } = await params;
  const event = await getEventForOwner(eventId, owner.organizationId);
  if (!event) notFound();

  const [items, staff] = await Promise.all([
    getScheduleForEvent(event.id, owner.organizationId),
    getStaffForEvent(event.id, owner.organizationId),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-stone-50">
          Cronograma del evento
        </h2>
        <p className="text-sm text-stone-400">
          Asigna tareas a cocina, música, decoración, puerta o coordinación. Cada
          persona las verá en su pantalla con su código.
        </p>
      </div>

      <ScheduleManager
        eventId={event.id}
        initial={items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          startAt: item.startAt.toISOString(),
          startLabel: formatTime(item.startAt),
          status: item.status,
          assigneeName: item.assignee?.name ?? "Sin asignar",
          assigneeRole: item.assignee
            ? roleLabel(item.assignee.role)
            : "Equipo",
        }))}
        staff={staff
          .filter((member) => member.active)
          .map((member) => ({
            id: member.id,
            name: member.name,
            roleLabel: roleLabel(member.role),
          }))}
      />
    </div>
  );
}
