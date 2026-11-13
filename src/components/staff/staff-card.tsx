"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw, ShieldCheck, UserX } from "lucide-react";
import {
  regenerateStaffCode,
  setStaffActive,
  updateStaff,
} from "@/actions/staff";
import { PERMISSION_LABELS, type StaffPermissions } from "@/lib/permissions";
import { defaultCanCheckIn, roleLabel, STAFF_ROLES } from "@/lib/roles";
import type { StaffRole } from "@/generated/prisma/enums";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function StaffCard({
  staff,
}: {
  staff: {
    id: string;
    name: string;
    code: string;
    role: StaffRole;
    canCheckIn: boolean;
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
  const [role, setRole] = useState<StaffRole>(staff.role);
  const [canCheckIn, setCanCheckIn] = useState(staff.canCheckIn);
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

  function changeRole(next: StaffRole) {
    setRole(next);
    setCanCheckIn(defaultCanCheckIn(next));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateStaff(staff.id, {
        name,
        role,
        canCheckIn,
        ...permissions,
      });
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  function regenerate() {
    setError(null);
    startTransition(async () => {
      const result = await regenerateStaffCode(staff.id);
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
      const result = await setStaffActive(staff.id, !active);
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
            <h3 className="text-base font-semibold text-stone-50">
              {staff.name}
            </h3>
            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 ring-1 ring-inset ring-amber-400/30">
              {roleLabel(staff.role)}
            </span>
            <span
              className={
                active
                  ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30"
                  : "rounded-full bg-stone-800 px-2 py-0.5 text-[11px] font-medium text-stone-400 ring-1 ring-inset ring-stone-700"
              }
            >
              {active ? "Activo" : "Inactivo"}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            {staff.checkIns} entrada{staff.checkIns !== 1 ? "s" : ""}
            {staff.lastCheckInLabel
              ? ` · última ${staff.lastCheckInLabel}`
              : ""}
            {staff.lastLoginLabel ? ` · entró ${staff.lastLoginLabel}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-stone-950 px-2.5 py-1 font-mono text-xs tracking-widest text-amber-300">
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`staff-name-${staff.id}`}>Nombre</Label>
            <Input
              id={`staff-name-${staff.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={`staff-role-${staff.id}`}>Rol</Label>
            <Select
              id={`staff-role-${staff.id}`}
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
        </div>

        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-stone-800 px-3 py-2 text-xs transition hover:border-amber-400/30">
          <input
            type="checkbox"
            checked={canCheckIn}
            onChange={(event) => setCanCheckIn(event.target.checked)}
            className="mt-0.5 size-3.5 rounded border-stone-700 text-amber-300 focus:ring-amber-400"
          />
          <span>
            <span className="block font-medium text-stone-200">
              Puede hacer check-in
            </span>
            <span className="block text-stone-500">
              Solo para roles de puerta o coordinación.
            </span>
          </span>
        </label>

        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-wide text-stone-400">
            Permisos
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PERMISSION_LABELS.map((permission) => (
              <label
                key={permission.key}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-stone-800 px-3 py-2 text-xs transition hover:border-amber-400/30"
              >
                <input
                  type="checkbox"
                  checked={permissions[permission.key]}
                  onChange={() => toggle(permission.key)}
                  className="mt-0.5 size-3.5 rounded border-stone-700 text-amber-300 focus:ring-amber-400"
                />
                <span>
                  <span className="block font-medium text-stone-200">
                    {permission.label}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Guardando…" : "Guardar cambios"}
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
