import { notFound } from "next/navigation";
import { KeyRound, ShieldCheck, Users } from "lucide-react";
import { StaffCard, StaffCreateDialog } from "@/components/staff-manager";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getEventForOwner } from "@/lib/queries/events";
import { getStaffForEvent } from "@/lib/queries/staff";
import { requireOwner } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Equipo" };
export const dynamic = "force-dynamic";

export default async function StaffPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const owner = await requireOwner();
  const { eventId } = await params;
  const event = await getEventForOwner(eventId, owner.organizationId);
  if (!event) notFound();

  const staff = await getStaffForEvent(event.id, owner.organizationId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">
            Equipo de puerta
          </h2>
          <p className="text-sm text-stone-500">
            Cada ayudante entra con un código único. Tú decides qué puede ver y
            hacer.
          </p>
        </div>
        <StaffCreateDialog eventId={event.id} />
      </div>

      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
            <KeyRound className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-stone-900">
              Un código, un ayudante
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-stone-500">
              Comparte el código solo con esa persona. Si se filtra, regenéralo:
              el anterior deja de funcionar al instante.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
          Permisos aplicados en el servidor
        </div>
      </Card>

      {staff.length === 0 ? (
        <EmptyState
          title="Aún no hay ayudantes"
          description="Crea el primer código para la persona que va a estar en la puerta. Puedes cambiar sus permisos en cualquier momento."
          action={<StaffCreateDialog eventId={event.id} />}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              staff={{
                id: member.id,
                name: member.name,
                code: member.code,
                active: member.active,
                canViewContact: member.canViewContact,
                canEditGuests: member.canEditGuests,
                canExport: member.canExport,
                canUndoCheckIn: member.canUndoCheckIn,
                canViewStats: member.canViewStats,
                lastLoginLabel: member.lastLoginAt
                  ? formatDateTime(member.lastLoginAt)
                  : null,
                lastCheckInLabel:
                  member.checkIns[0]?.checkedInAt
                    ? formatDateTime(member.checkIns[0].checkedInAt)
                    : null,
                checkIns: member._count.checkIns,
              }}
            />
          ))}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-stone-400">
        <Users className="h-3.5 w-3.5" aria-hidden />
        Los ayudantes solo pueden ver el evento al que pertenece su código.
      </p>
    </div>
  );
}
