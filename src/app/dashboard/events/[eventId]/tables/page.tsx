import { notFound } from "next/navigation";
import { SeatingBoard } from "@/components/seating-board";
import { TableCreateForm } from "@/components/table-create-form";
import { getEventForOwner } from "@/lib/queries/events";
import { getTablesForEvent } from "@/lib/queries/tables";
import { requireOwner } from "@/lib/session";

export const metadata = { title: "Mesas y sillas" };
export const dynamic = "force-dynamic";

export default async function TablesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const owner = await requireOwner();
  const { eventId } = await params;
  const event = await getEventForOwner(eventId, owner.organizationId);
  if (!event) notFound();

  const tables = await getTablesForEvent(event.id, owner.organizationId);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-medium tracking-tight text-stone-50">
          Mesas y sillas
        </h2>
        <p className="text-sm text-stone-400">
          Organiza la distribución y marca una silla como ocupada con un clic.
          Cuando todas las sillas de una mesa estén ocupadas, la mesa se pone
          roja.
        </p>
      </div>

      <TableCreateForm eventId={event.id} />

      <SeatingBoard
        initial={tables.map((table) => ({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          chairs: table.chairs.map((chair) => ({
            id: chair.id,
            number: chair.number,
            occupied: chair.occupied,
          })),
        }))}
      />
    </div>
  );
}
