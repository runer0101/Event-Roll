"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { createGuest, deleteGuest, updateGuest } from "@/actions/guests";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type GuestFormValue = {
  id?: string;
  name: string;
  email: string | null;
  phone: string | null;
  category: string | null;
  plusOnes: number;
  table: string | null;
  notes: string | null;
};

export function GuestDialog({
  eventId,
  guest,
  triggerLabel,
}: {
  eventId: string;
  guest?: GuestFormValue;
  triggerLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(guest?.id);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      category: data.get("category"),
      plusOnes: data.get("plusOnes"),
      table: data.get("table"),
      notes: data.get("notes"),
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateGuest(guest!.id!, payload)
        : await createGuest(eventId, payload);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!guest?.id) return;
    if (!window.confirm("¿Eliminar este invitado de la lista?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteGuest(guest.id!);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant={isEdit ? "ghost" : "accent"}
        size={isEdit ? "sm" : "md"}
        onClick={() => setOpen(true)}
      >
        {!isEdit && <Plus className="h-4 w-4" aria-hidden />}
        {triggerLabel}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="guest-title"
                  className="text-lg font-semibold text-stone-50"
                >
                  {isEdit ? "Editar invitado" : "Agregar invitado"}
                </h2>
                <p className="mt-1 text-sm text-stone-400">
                  {isEdit
                    ? "Actualiza los datos del invitado."
                    : "Se generará un código de invitación automáticamente."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-stone-500 hover:bg-stone-800 hover:text-stone-200"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && <Alert variant="danger">{error}</Alert>}

              <div>
                <Label htmlFor="guest-name">Nombre</Label>
                <Input
                  id="guest-name"
                  name="name"
                  required
                  defaultValue={guest?.name}
                  className="mt-1.5"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="guest-email">Email</Label>
                  <Input
                    id="guest-email"
                    name="email"
                    type="email"
                    defaultValue={guest?.email ?? ""}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-phone">Teléfono</Label>
                  <Input
                    id="guest-phone"
                    name="phone"
                    type="tel"
                    defaultValue={guest?.phone ?? ""}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="guest-category">Categoría</Label>
                  <Input
                    id="guest-category"
                    name="category"
                    placeholder="VIP, General…"
                    defaultValue={guest?.category ?? ""}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-plus">Acompañantes</Label>
                  <Input
                    id="guest-plus"
                    name="plusOnes"
                    type="number"
                    min={0}
                    max={20}
                    defaultValue={guest?.plusOnes ?? 0}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-table">Mesa</Label>
                  <Input
                    id="guest-table"
                    name="table"
                    defaultValue={guest?.table ?? ""}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guest-notes">Notas</Label>
                <Textarea
                  id="guest-notes"
                  name="notes"
                  defaultValue={guest?.notes ?? ""}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                {isEdit ? (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    disabled={pending}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Eliminar
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending
                      ? "Guardando…"
                      : isEdit
                        ? "Guardar cambios"
                        : "Agregar invitado"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
