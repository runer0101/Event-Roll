import { EventForm } from "@/components/event-form";
import { Card } from "@/components/ui/card";
import { requireOwner } from "@/lib/session";

export const metadata = { title: "Nuevo evento" };

export default async function NewEventPage() {
  await requireOwner();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
          Nuevo evento
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Prepara la puerta
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Crea el evento y después importa la lista de invitados.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <EventForm mode="create" />
      </Card>
    </div>
  );
}
