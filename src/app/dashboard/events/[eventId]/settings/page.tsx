import { notFound } from "next/navigation";
import { EventDangerZone } from "@/components/event-danger-zone";
import { EventForm } from "@/components/event-form";
import { Card } from "@/components/ui/card";
import { getEventForOwner } from "@/lib/queries/events";
import { requireOwner } from "@/lib/session";
import { toDateTimeInput } from "@/lib/utils";

export const metadata = { title: "Ajustes" };
export const dynamic = "force-dynamic";

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const owner = await requireOwner();
  const { eventId } = await params;
  const event = await getEventForOwner(eventId, owner.organizationId);
  if (!event) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-stone-900">
          Ajustes del evento
        </h2>
        <p className="text-sm text-stone-500">
          Datos generales, estado del check-in y eliminación del evento.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <EventForm
          mode="edit"
          eventId={event.id}
          initial={{
            name: event.name,
            date: toDateTimeInput(event.date),
            location: event.location,
            description: event.description ?? "",
          }}
        />
      </Card>

      <EventDangerZone
        eventId={event.id}
        status={event.status === "ACTIVE" ? "ACTIVE" : "CLOSED"}
      />
    </div>
  );
}
