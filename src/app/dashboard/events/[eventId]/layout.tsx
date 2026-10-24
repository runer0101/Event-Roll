import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
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
        className="group inline-flex items-center gap-1.5 text-sm text-stone-400 transition hover:text-amber-100"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
        Todos los eventos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={event.status === "ACTIVE" ? "success" : "muted"}>
              {event.status === "ACTIVE" ? "Activo" : "Cerrado"}
            </Badge>
            <span className="eyebrow text-stone-500">
              Panel del organizador
            </span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-5xl">
            {event.name}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-amber-300/80" aria-hidden />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-amber-300/80" aria-hidden />
              {event.location}
            </span>
          </p>
        </div>
      </div>

      <EventTabs eventId={event.id} />
      {children}
    </div>
  );
}
