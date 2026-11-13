"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { createStaff } from "@/actions/staff";
import {
  DEFAULT_STAFF_PERMISSIONS,
  PERMISSION_LABELS,
  type StaffPermissions,
} from "@/lib/permissions";
import { defaultCanCheckIn, STAFF_ROLES } from "@/lib/roles";
import type { StaffRole } from "@/generated/prisma/enums";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function StaffCreateDialog({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<StaffPermissions>(
    DEFAULT_STAFF_PERMISSIONS,
  );
  const [role, setRole] = useState<StaffRole>("GUARD");
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(key: keyof StaffPermissions) {
    setPermissions((current) => ({ ...current, [key]: !current[key] }));
  }

  function changeRole(next: StaffRole) {
    setRole(next);
    setCanCheckIn(defaultCanCheckIn(next));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createStaff(eventId, {
        name: data.get("name"),
        role,
        canCheckIn,
        ...permissions,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setCode(result.code ?? null);
      router.refresh();
    });
  }

  function close() {
    setOpen(false);
    setCode(null);
    setError(null);
    setPermissions(DEFAULT_STAFF_PERMISSIONS);
    setRole("GUARD");
    setCanCheckIn(true);
  }

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        <KeyRound className="h-4 w-4" aria-hidden />
        Nuevo miembro del equipo
      </Button>

      <Dialog
        open={open}
        onClose={close}
        title="Nuevo miembro del equipo"
        description="Cada persona recibe un código único y ve solo lo que le asignes."
      >
        {code ? (
          <div className="mt-6 space-y-4">
            <Alert variant="success">
              Miembro creado. Comparte este código por un canal privado.
            </Alert>
            <Card className="border-amber-400/30 bg-stone-950 p-5 text-stone-50">
              <p className="text-xs uppercase tracking-widest text-stone-500">
                Código de acceso
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold tracking-widest text-amber-300">
                {code}
              </p>
              <div className="mt-4">
                <CopyButton value={code} label="Copiar código" />
              </div>
            </Card>
            <div className="flex justify-end">
              <Button onClick={close}>Listo</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && <Alert variant="danger">{error}</Alert>}

            <div>
              <Label htmlFor="staff-name">Nombre</Label>
              <Input
                id="staff-name"
                name="name"
                placeholder="Ej. Carla · puerta principal"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="staff-role">Rol en el evento</Label>
              <Select
                id="staff-role"
                value={role}
                onChange={(event) =>
                  changeRole(event.target.value as StaffRole)
                }
                className="mt-1.5"
              >
                {STAFF_ROLES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-800 p-3 transition hover:border-amber-400/30">
              <input
                type="checkbox"
                checked={canCheckIn}
                onChange={(event) => setCanCheckIn(event.target.checked)}
                className="mt-0.5 size-4 rounded border-stone-700 text-amber-300 focus:ring-amber-400"
              />
              <span>
                <span className="block text-sm font-medium text-stone-100">
                  Puede hacer check-in
                </span>
                <span className="block text-xs text-stone-400">
                  Verá la pantalla de puerta para buscar invitados y marcar
                  entradas.
                </span>
              </span>
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-stone-100">
                ¿Qué puede ver y hacer?
              </legend>
              <div className="mt-2 space-y-2">
                {PERMISSION_LABELS.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-800 p-3 transition hover:border-amber-400/30 hover:bg-amber-400/5"
                  >
                    <input
                      type="checkbox"
                      checked={permissions[permission.key]}
                      onChange={() => toggle(permission.key)}
                      className="mt-0.5 size-4 rounded border-stone-700 text-amber-300 focus:ring-amber-400"
                    />
                    <span>
                      <span className="block text-sm font-medium text-stone-100">
                        {permission.label}
                      </span>
                      <span className="block text-xs text-stone-400">
                        {permission.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={close}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Creando…" : "Crear miembro"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
