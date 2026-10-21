"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { KeyRound, RefreshCw, ShieldCheck, UserX, X } from "lucide-react";
import {
  createStaff,
  regenerateStaffCode as regenerateStaffCodeLocal,
  setStaffActive as setStaffActiveLocal,
  updateStaff as updateStaffLocal,
} from "@/actions/staff";
import {
  DEFAULT_STAFF_PERMISSIONS,
  PERMISSION_LABELS,
  type StaffPermissions,
} from "@/lib/permissions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StaffCreateDialog({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<StaffPermissions>(
    DEFAULT_STAFF_PERMISSIONS,
  );
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(key: keyof StaffPermissions) {
    setPermissions((current) => ({ ...current, [key]: !current[key] }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createStaff(eventId, {
        name: data.get("name"),
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
  }

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        <KeyRound className="h-4 w-4" aria-hidden />
        Nuevo ayudante
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="staff-create-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="staff-create-title"
                  className="text-lg font-semibold text-stone-900"
                >
                  Nuevo ayudante
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Se generará un código único. Solo esa persona lo necesita para
                  entrar.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {code ? (
              <div className="mt-6 space-y-4">
                <Alert variant="success">
                  Ayudante creado. Comparte este código por un canal privado.
                </Alert>
                <Card className="bg-stone-950 p-5 text-stone-50">
                  <p className="text-xs uppercase tracking-widest text-stone-400">
                    Código de acceso
                  </p>
                  <p className="mt-2 font-mono text-2xl font-semibold tracking-widest">
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
                    placeholder="Ej. Carla, puerta principal"
                    required
                    className="mt-1.5"
                  />
                </div>

                <fieldset>
                  <legend className="text-sm font-medium text-stone-800">
                    ¿Qué puede ver y hacer?
                  </legend>
                  <div className="mt-2 space-y-2">
                    {PERMISSION_LABELS.map((permission) => (
                      <label
                        key={permission.key}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3 transition hover:border-orange-200 hover:bg-orange-50/40"
                      >
                        <input
                          type="checkbox"
                          checked={permissions[permission.key]}
                          onChange={() => toggle(permission.key)}
                          className="mt-0.5 size-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span>
                          <span className="block text-sm font-medium text-stone-800">
                            {permission.label}
                          </span>
                          <span className="block text-xs text-stone-500">
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
                    {pending ? "Creando…" : "Crear ayudante"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function StaffCard({
  staff,
}: {
  staff: {
    id: string;
    name: string;
    code: string;
    active: boolean;
    canViewContact: boolean;
    canEditGuests: boolean;
    canExport: boolean;
    canUndoCheckIn: boolean;
    canViewStats: boolean;
    lastLoginLabel: string | null;
    lastCheckInLabel: string | null;
    checkIns: number;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(staff.name);
  const [code, setCode] = useState(staff.code);
  const [active, setActive] = useState(staff.active);
  const [permissions, setPermissions] = useState<StaffPermissions>({
    canViewContact: staff.canViewContact,
    canEditGuests: staff.canEditGuests,
    canExport: staff.canExport,
    canUndoCheckIn: staff.canUndoCheckIn,
    canViewStats: staff.canViewStats,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(key: keyof StaffPermissions) {
    setPermissions((current) => ({ ...current, [key]: !current[key] }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateStaffLocal(staff.id, { name, ...permissions });
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  function regenerate() {
    setError(null);
    startTransition(async () => {
      const result = await regenerateStaffCodeLocal(staff.id);
      if (result?.error) setError(result.error);
      else if (result.code) {
        setCode(result.code);
        router.refresh();
      }
    });
  }

  function toggleActive() {
    setError(null);
    startTransition(async () => {
      const result = await setStaffActiveLocal(staff.id, !active);
      if (result?.error) setError(result.error);
      else {
        setActive((current) => !current);
        router.refresh();
      }
    });
  }

  return (
    <Card className={active ? "p-5" : "p-5 opacity-70"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-stone-900">
              {staff.name}
            </h3>
            <span
              className={
                active
                  ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200"
                  : "rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500 ring-1 ring-inset ring-stone-200"
              }
            >
              {active ? "Activo" : "Inactivo"}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {staff.checkIns} entrada{staff.checkIns !== 1 ? "s" : ""}
            {staff.lastCheckInLabel
              ? ` · última ${staff.lastCheckInLabel}`
              : ""}
            {staff.lastLoginLabel ? ` · entró ${staff.lastLoginLabel}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-stone-950 px-2.5 py-1 font-mono text-xs tracking-widest text-stone-50">
            {code}
          </span>
          <CopyButton value={code} label="Copiar" />
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerate}
            disabled={pending}
            title="Regenerar código"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      )}

      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <div>
          <Label htmlFor={`staff-name-${staff.id}`}>Nombre</Label>
          <Input
            id={`staff-name-${staff.id}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1.5 max-w-sm"
          />
        </div>

        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Permisos
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PERMISSION_LABELS.map((permission) => (
              <label
                key={permission.key}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs transition hover:border-orange-200"
              >
                <input
                  type="checkbox"
                  checked={permissions[permission.key]}
                  onChange={() => toggle(permission.key)}
                  className="mt-0.5 size-3.5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                />
                <span>
                  <span className="block font-medium text-stone-700">
                    {permission.label}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Guardando…" : "Guardar permisos"}
          </Button>
          <Button
            type="button"
            variant={active ? "ghost" : "outline"}
            size="sm"
            onClick={toggleActive}
            disabled={pending}
          >
            {active ? (
              <>
                <UserX className="h-3.5 w-3.5" aria-hidden />
                Desactivar
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Reactivar
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

