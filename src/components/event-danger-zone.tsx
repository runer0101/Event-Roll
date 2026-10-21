"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Lock, LockOpen, Trash2 } from "lucide-react";
import { deleteEvent, setEventStatus } from "@/actions/events";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EventDangerZone({
  eventId,
  status,
}: {
  eventId: string;
  status: "ACTIVE" | "CLOSED";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isActive = status === "ACTIVE";

  function toggleStatus() {
    setError(null);
    startTransition(async () => {
      const result = await setEventStatus(eventId, isActive ? "CLOSED" : "ACTIVE");
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  function remove() {
    if (
      !window.confirm(
        "¿Eliminar el evento y toda su lista de invitados? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteEvent(eventId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">
              {isActive ? "Cerrar el evento" : "Reabrir el evento"}
            </h3>
            <p className="mt-1 max-w-xl text-sm text-stone-500">
              {isActive
                ? "Al cerrarlo, los guardias ya no podrán marcar entradas. La lista y el historial se conservan."
                : "Vuelve a habilitar el check-in para este evento."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleStatus}
            disabled={pending}
          >
            {isActive ? (
              <>
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Cerrar evento
              </>
            ) : (
              <>
                <LockOpen className="h-3.5 w-3.5" aria-hidden />
                Reabrir evento
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="border-red-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-red-700">
              Eliminar el evento
            </h3>
            <p className="mt-1 max-w-xl text-sm text-stone-500">
              Se borran la lista, los códigos del equipo y el historial de
              accesos. No se puede deshacer.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={remove}
            disabled={pending}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Eliminar evento
          </Button>
        </div>
      </Card>
    </div>
  );
}
