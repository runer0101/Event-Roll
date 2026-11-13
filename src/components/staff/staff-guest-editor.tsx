"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { updateGuest } from "@/actions/guests";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type EditableStaffGuest = {
  id: string;
  name: string;
  category: string | null;
  plusOnes: number;
  table?: string | null;
  notes?: string | null;
};

/** Compact editor for coordinators with `canEditGuests`. */
export function StaffGuestEditor({
  guest,
  onSaved,
}: {
  guest: EditableStaffGuest;
  onSaved: (guest: EditableStaffGuest) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const next: EditableStaffGuest = {
      id: guest.id,
      name: String(data.get("name") ?? "").trim(),
      category: String(data.get("category") ?? "").trim() || null,
      plusOnes: Number.parseInt(String(data.get("plusOnes") ?? "0"), 10) || 0,
      table: String(data.get("table") ?? "").trim() || null,
      notes: String(data.get("notes") ?? "").trim() || null,
    };

    startTransition(async () => {
      const result = await updateGuest(guest.id, {
        name: next.name,
        category: next.category ?? "",
        plusOnes: next.plusOnes,
        table: next.table ?? "",
        notes: next.notes ?? "",
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      onSaved(next);
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        title="Editar invitado"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Editar</span>
      </Button>

      <Dialog
        open={open}
        onClose={close}
        dismissible={!pending}
        title={guest.name}
        eyebrow="Editar invitado"
        maxWidth="max-w-md"
      >
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}

          <div>
            <Label htmlFor={`edit-name-${guest.id}`}>Nombre</Label>
            <Input
              id={`edit-name-${guest.id}`}
              name="name"
              defaultValue={guest.name}
              required
              maxLength={120}
              autoFocus
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor={`edit-category-${guest.id}`}>
                Categoría
              </Label>
              <Input
                id={`edit-category-${guest.id}`}
                name="category"
                defaultValue={guest.category ?? ""}
                maxLength={40}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={`edit-plus-${guest.id}`}>
                Acompañantes
              </Label>
              <Input
                id={`edit-plus-${guest.id}`}
                name="plusOnes"
                type="number"
                min={0}
                max={20}
                defaultValue={guest.plusOnes}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`edit-table-${guest.id}`}>Mesa</Label>
            <Input
              id={`edit-table-${guest.id}`}
              name="table"
              defaultValue={guest.table ?? ""}
              maxLength={40}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor={`edit-notes-${guest.id}`}>Notas</Label>
            <Textarea
              id={`edit-notes-${guest.id}`}
              name="notes"
              defaultValue={guest.notes ?? ""}
              maxLength={500}
              className="mt-1.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={close}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
