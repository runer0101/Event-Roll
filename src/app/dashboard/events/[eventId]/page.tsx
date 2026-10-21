import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Armchair,
  CalendarClock,
  ExternalLink,
  FileSpreadsheet,
  UserPlus,
  Users,
} from "lucide-react";
import { LiveEvent } from "@/components/live-event";
import { CopyButton } from "@/components/ui/copy-button";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getEventForOwner } from "@/lib/queries/events";
import { getLiveData } from "@/lib/queries/live";
import { requireOwner } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";

export const metadata = { title: "Evento" };
export const dynamic = "force-dynamic";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const owner = await requireOwner();
  const { eventId } = await params;
  const event = await getEventForOwner(eventId, owner.organizationId);
  if (!event) notFound();

  const live = await getLiveData(event.id, owner.organizationId);
  const staffUrl = absoluteUrl("/staff");

  return (
    <div className="space-y-6">
      <LiveEvent eventId={event.id} initial={live} canUndo />

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
              <Users className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-stone-50">
                Comparte el acceso con tu equipo
              </h2>
              <p className="mt-1 max-w-xl text-sm text-stone-400">
                Cada ayudante entra en{" "}
                <span className="font-mono text-xs text-stone-200">
                  {staffUrl}
                </span>{" "}
                con su código único. Tú decides qué puede ver y hacer.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton value={staffUrl} label="Copiar enlace" />
            <Link
              href={`/dashboard/events/${event.id}/staff`}
              className={buttonClasses("outline", "sm")}
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
              Gestionar equipo
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-2 border-t border-stone-100 pt-5 sm:grid-cols-3">
          <Link
            href={`/dashboard/events/${event.id}/guests`}
            className="flex items-center gap-2 rounded-xl border border-stone-800 px-3 py-2.5 text-sm text-stone-200 transition hover:border-amber-400/30 hover:bg-amber-400/10"
          >
            <FileSpreadsheet className="h-4 w-4 text-amber-300" aria-hidden />
            Importar invitados
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/tables`}
            className="flex items-center gap-2 rounded-xl border border-stone-800 px-3 py-2.5 text-sm text-stone-200 transition hover:border-amber-400/30 hover:bg-amber-400/10"
          >
            <Armchair className="h-4 w-4 text-amber-300" aria-hidden />
            Mesas y sillas
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/schedule`}
            className="flex items-center gap-2 rounded-xl border border-stone-800 px-3 py-2.5 text-sm text-stone-200 transition hover:border-amber-400/30 hover:bg-amber-400/10"
          >
            <CalendarClock className="h-4 w-4 text-amber-300" aria-hidden />
            Cronograma
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/staff`}
            className="flex items-center gap-2 rounded-xl border border-stone-800 px-3 py-2.5 text-sm text-stone-200 transition hover:border-amber-400/30 hover:bg-amber-400/10"
          >
            <UserPlus className="h-4 w-4 text-amber-300" aria-hidden />
            Crear códigos de equipo
          </Link>
          <Link
            href="/staff"
            target="_blank"
            className="flex items-center gap-2 rounded-xl border border-stone-800 px-3 py-2.5 text-sm text-stone-200 transition hover:border-amber-400/30 hover:bg-amber-400/10"
          >
            <ExternalLink className="h-4 w-4 text-amber-300" aria-hidden />
            Abrir vista de guardia
          </Link>
        </div>
      </Card>
    </div>
  );
}
