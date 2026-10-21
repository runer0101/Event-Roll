"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createEvent, updateEvent } from "@/actions/events";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EventFormProps = {
  mode: "create" | "edit";
  eventId?: string;
  defaultDate?: string;
  initial?: {
    name: string;
    date: string;
    location: string;
    description: string;
  };
};

export function EventForm({
  mode,
  eventId,
  defaultDate,
  initial,
}: EventFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const payload = {
      name: data.get("name"),
      date: data.get("date"),
      location: data.get("location"),
      description: data.get("description"),
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEvent(payload)
          : await updateEvent(eventId!, payload);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (mode === "create" && result.eventId) {
        router.push(`/dashboard/events/${result.eventId}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="danger">{error}</Alert>}

      <div>
        <Label htmlFor="name">Nombre del evento</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ej. Sunset Fest 2026"
          required
          defaultValue={initial?.name}
          className="mt-1.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="date">Fecha y hora</Label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            required
            defaultValue={initial?.date ?? defaultDate}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="location">Lugar</Label>
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="Ej. Plaza Mayor"
            required
            defaultValue={initial?.location}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Notas internas, dress code, instrucciones para la puerta…"
          defaultValue={initial?.description}
          className="mt-1.5"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending
            ? mode === "create"
              ? "Creando…"
              : "Guardando…"
            : mode === "create"
              ? "Crear evento"
              : "Guardar cambios"}
        </Button>
        <span className="flex items-center gap-1.5 text-xs text-stone-500">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          Podrás importar la lista y crear códigos después.
        </span>
      </div>
    </form>
  );
}

export function EventDateHint() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-stone-500">
      <MapPin className="h-3.5 w-3.5" aria-hidden />
      La dirección ayuda a tu equipo a ubicar la puerta.
    </p>
  );
}
