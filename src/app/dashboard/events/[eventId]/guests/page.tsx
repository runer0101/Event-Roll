import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Download,
  FileSpreadsheet,
  Search,
  Users,
  X,
} from "lucide-react";
import { GuestDialog } from "@/components/guest-dialog";
import { GuestImport } from "@/components/guest-import";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getEventForOwner } from "@/lib/queries/events";
import { getGuestsPage } from "@/lib/queries/guests";
import { requireOwner } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";
import type { GuestStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Invitados" };
export const dynamic = "force-dynamic";

const STATUS_OPTIONS: Array<{ value: GuestStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "INVITED", label: "Pendientes" },
  { value: "CHECKED_IN", label: "Dentro" },
  { value: "CANCELLED", label: "Cancelados" },
];

function statusBadge(status: GuestStatus) {
  if (status === "CHECKED_IN") return <Badge variant="success">Dentro</Badge>;
  if (status === "CANCELLED") return <Badge variant="danger">Cancelado</Badge>;
  return <Badge variant="warning">Pendiente</Badge>;
}

export default async function GuestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const owner = await requireOwner();
  const { eventId } = await params;
  const filters = await searchParams;
  const event = await getEventForOwner(eventId, owner.organizationId);
  if (!event) notFound();

  const rawStatus = filters.status ?? "ALL";
  const status = STATUS_OPTIONS.some((option) => option.value === rawStatus)
    ? (rawStatus as GuestStatus | "ALL")
    : "ALL";
  const query = filters.q ?? "";
  const page = Number.parseInt(filters.page ?? "1", 10) || 1;

  const data = await getGuestsPage(event.id, owner.organizationId, {
    query,
    status,
    page,
  });

  const hasFilters = query.trim() !== "" || status !== "ALL";
  const basePath = `/dashboard/events/${event.id}/guests`;

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (status !== "ALL") params.set("status", status);
    params.set("page", String(target));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-stone-50">
            Lista de invitados
          </h2>
          <p className="text-sm text-stone-400">
            {data.total} invitado{data.total !== 1 ? "s" : ""}
            {hasFilters ? " con los filtros actuales" : " en total"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/api/events/${event.id}/export`}
            className={buttonClasses("ghost", "sm")}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Exportar CSV
          </Link>
          <GuestImport eventId={event.id} />
          <GuestDialog eventId={event.id} triggerLabel="Agregar invitado" />
        </div>
      </div>

      <Card className="p-4">
        <form className="flex flex-wrap items-center gap-2" action={basePath}>
          <div className="relative min-w-64 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
              aria-hidden
            />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Buscar por nombre, email, teléfono o código"
              className="pl-9"
            />
          </div>
          <Select name="status" defaultValue={status} className="w-40">
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline">
            Filtrar
          </Button>
          {hasFilters && (
            <Link
              href={basePath}
              className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-stone-400 hover:text-stone-50"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Limpiar
            </Link>
          )}
        </form>
      </Card>

      {data.guests.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Sin resultados" : "La lista está vacía"}
          description={
            hasFilters
              ? "Prueba con otro nombre, correo o código, o limpia los filtros."
              : "Importa el Excel del cliente o agrega el primer invitado a mano."
          }
          action={
            hasFilters ? (
              <Link href={basePath} className={buttonClasses("outline")}>
                Limpiar filtros
              </Link>
            ) : (
              <GuestDialog eventId={event.id} triggerLabel="Agregar invitado" />
            )
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-stone-800/80 bg-stone-900/50 text-[10px] uppercase tracking-[0.16em] text-stone-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Invitado</th>
                  <th className="px-4 py-3 font-medium">Contacto</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Acompañantes</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Check-in</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {data.guests.map((guest) => (
                  <tr
                    key={guest.id}
                    className="align-top transition-colors hover:bg-amber-400/[0.035]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-50">{guest.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-stone-500">
                        {guest.code}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-stone-300">
                      {guest.email && (
                        <p className="text-xs">{guest.email}</p>
                      )}
                      {guest.phone && (
                        <p className="text-xs text-stone-400">{guest.phone}</p>
                      )}
                      {!guest.email && !guest.phone && (
                        <span className="text-xs text-stone-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-300">
                      {guest.category || "—"}
                      {guest.table && (
                        <p className="text-xs text-stone-500">
                          Mesa {guest.table}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-300">
                      {guest.plusOnes > 0 ? `+${guest.plusOnes}` : "—"}
                    </td>
                    <td className="px-4 py-3">{statusBadge(guest.status)}</td>
                    <td className="px-4 py-3 text-xs text-stone-400">
                      {guest.checkedInAt ? (
                        <>
                          <p>{formatDateTime(guest.checkedInAt)}</p>
                          <p className="text-stone-500">
                            {guest.checkedInBy?.name ?? "Guardia"}
                          </p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <GuestDialog
                        eventId={event.id}
                        triggerLabel="Editar"
                        guest={{
                          id: guest.id,
                          name: guest.name,
                          email: guest.email,
                          phone: guest.phone,
                          category: guest.category,
                          plusOnes: guest.plusOnes,
                          table: guest.table,
                          notes: guest.notes,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-800 px-4 py-3 text-sm text-stone-400">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden />
              Página {data.page} de {data.pageCount}
            </span>
            <div className="flex items-center gap-2">
              {data.page > 1 ? (
                <Link
                  href={pageHref(data.page - 1)}
                  className={buttonClasses("outline", "sm")}
                >
                  Anterior
                </Link>
              ) : (
                <span className={buttonClasses("outline", "sm", "opacity-40")}>
                  Anterior
                </span>
              )}
              {data.page < data.pageCount ? (
                <Link
                  href={pageHref(data.page + 1)}
                  className={buttonClasses("outline", "sm")}
                >
                  Siguiente
                </Link>
              ) : (
                <span className={buttonClasses("outline", "sm", "opacity-40")}>
                  Siguiente
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      <p className="flex items-center gap-1.5 text-xs text-stone-500">
        <FileSpreadsheet className="h-3.5 w-3.5 text-amber-300/80" aria-hidden />
        El código de cada invitado sirve para buscarlo rápido en la puerta.
      </p>
    </div>
  );
}
