"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock,
  Plus,
  RotateCcw,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  createScheduleItem,
  deleteScheduleItem,
  toggleScheduleItem,
} from "@/actions/schedule";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatTime } from "@/lib/utils";

type ScheduleItemView = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  startLabel: string;
  status: "PENDING" | "DONE";
  assigneeName: string;
  assigneeRole: string;
};

type StaffOption = {
  id: string;
  name: string;
  roleLabel: string;
};

export function ScheduleManager({
  eventId,
  initial,
  staff,
}: {
  eventId: string;
  initial: ScheduleItemView[];
  staff: StaffOption[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const rawStart = String(data.get("startAt") ?? "");
    const startAt = rawStart ? new Date(rawStart).toISOString() : rawStart;
    const assigneeId = String(data.get("assigneeId") ?? "");
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const start = new Date(startAt);
    const assignee = staff.find((item) => item.id === assigneeId);

    startTransition(async () => {
      const result = await createScheduleItem(eventId, {
        title,
        startAt,
        assigneeId,
        description,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result.itemId) {
        setItems((current) =>
          [
            ...current,
            {
              id: result.itemId!,
              title,
              description: description || null,
              startAt: start.toISOString(),
              startLabel: formatTime(start),
              status: "PENDING" as const,
              assigneeName: assignee?.name ?? "Sin asignar",
              assigneeRole: assignee?.roleLabel ?? "Equipo",
            },
          ].sort((a, b) => a.startAt.localeCompare(b.startAt)),
        );
      }
      form.reset();
      router.refresh();
    });
  }

  function toggle(item: ScheduleItemView) {
    setError(null);
    const next = item.status === "DONE" ? "PENDING" : "DONE";
    setItems((current) =>
      current.map((row) =>
        row.id === item.id ? { ...row, status: next } : row,
      ),
    );
    startTransition(async () => {
      const result = await toggleScheduleItem(item.id);
      if (result?.error) {
        setError(result.error);
        setItems((current) =>
          current.map((row) =>
            row.id === item.id ? { ...row, status: item.status } : row,
          ),
        );
      } else {
        router.refresh();
      }
    });
  }

  function remove(item: ScheduleItemView) {
    if (!window.confirm(`¿Eliminar la tarea «${item.title}»?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteScheduleItem(item.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setItems((current) => current.filter((row) => row.id !== item.id));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-50">
          <Plus className="h-4 w-4 text-amber-300" aria-hidden />
          Agregar tarea al cronograma
        </h2>
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Label htmlFor="schedule-title">Tarea</Label>
              <Input
                id="schedule-title"
                name="title"
                placeholder="Ej. Servicio de cena"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="schedule-start">Hora</Label>
              <Input
                id="schedule-start"
                name="startAt"
                type="datetime-local"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="schedule-assignee">Responsable</Label>
              <Select
                id="schedule-assignee"
                name="assigneeId"
                defaultValue=""
                className="mt-1.5"
              >
                <option value="">Sin asignar</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {member.roleLabel}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="schedule-description">Notas (opcional)</Label>
            <Textarea
              id="schedule-description"
              name="description"
              className="mt-1.5 min-h-16"
              placeholder="Instrucciones, materiales o alergias a revisar…"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              <Plus className="h-4 w-4" aria-hidden />
              {pending ? "Guardando…" : "Agregar al cronograma"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {items.length === 0 ? (
          <Card className="p-8 text-center text-sm text-stone-400">
            Aún no hay tareas. Agrega la primera para que tu equipo sepa qué
            hacer y a qué hora.
          </Card>
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "p-4",
                item.status === "DONE" && "border-emerald-500/30 bg-emerald-500/5",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
                    <Clock className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-amber-300">
                        {item.startLabel}
                      </span>
                      <Badge
                        variant={item.status === "DONE" ? "success" : "warning"}
                      >
                        {item.status === "DONE" ? "Hecha" : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-stone-50">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-stone-400">
                        {item.description}
                      </p>
                    )}
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-400">
                      <UserRound className="h-3.5 w-3.5" aria-hidden />
                      {item.assigneeName} · {item.assigneeRole}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggle(item)}
                    disabled={pending}
                  >
                    {item.status === "DONE" ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                        Reabrir
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        Marcar hecha
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(item)}
                    disabled={pending}
                    title="Eliminar tarea"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" aria-hidden />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
