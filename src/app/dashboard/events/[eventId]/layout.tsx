import Link from "next/link";
import { notFound } from "next/navigation";
import { EventTabs } from "@/components/event-tabs";
import { Badge } from "@/components/ui/badge";
import { getEventForOwner } from "@/lib/queries/events";
import { requireOwner } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const owner = await requireOwner();
  const { eventId } = await params;
  const event = await getEventForOwner(eventId, owner.organizationId);
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 underline decoration-stone-700 underline-offset-4 transition-colors hover:text-stone-50"
      >
        Todos los eventos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={event.status === "ACTIVE" ? "success" : "muted"}>
              {event.status === "ACTIVE" ? "Activo" : "Cerrado"}
            </Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
              Panel del organizador
            </span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-5xl">
            {event.name}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-400">
            <span>{formatDate(event.date)}</span>
            <span aria-hidden className="h-3 w-px bg-stone-700" />
            <span>{event.location}</span>
          </p>
        </div>
      </div>

      <EventTabs eventId={event.id} />
      {children}
    </div>
  );
}
