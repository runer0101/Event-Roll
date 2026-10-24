import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { csvCell } from "@/lib/csv";
import { getEventForOwner } from "@/lib/queries/events";
import { getActiveStaff } from "@/lib/queries/staff";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  INVITED: "Pendiente",
  CHECKED_IN: "Dentro",
  CANCELLED: "Cancelado",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth();
  const user = session?.user;
  if (!user) return new Response("No autorizado", { status: 401 });

  const { eventId } = await params;
  const event = await getEventForOwner(eventId, user.organizationId);
  if (!event) return new Response("Evento no encontrado", { status: 404 });

  let includeContact = true;
  if (user.role === "STAFF") {
    if (!user.staffId || !user.eventId) {
      return new Response("No autorizado", { status: 401 });
    }
    // Staff access is scoped to their own event, not just to the organization.
    if (event.id !== user.eventId) {
      return new Response("No autorizado", { status: 403 });
    }
    const staff = await getActiveStaff(
      user.staffId,
      user.eventId,
      user.organizationId,
      user.staffSessionVersion ?? -1,
    );
    if (!staff?.canExport) {
      return new Response("No autorizado", { status: 403 });
    }
    includeContact = staff.canViewContact;
  }

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id, organizationId: event.organizationId },
    orderBy: { name: "asc" },
    include: { checkedInBy: { select: { name: true } } },
  });

  const headers = [
    "Nombre",
    "Código",
    ...(includeContact ? ["Email", "Teléfono"] : []),
    "Categoría",
    "Acompañantes",
    "Mesa",
    "Estado",
    "Check-in",
    "Validado por",
  ];

  const lines = [headers.map(csvCell).join(",")];
  for (const guest of guests) {
    lines.push(
      [
        csvCell(guest.name),
        csvCell(guest.code),
        ...(includeContact
          ? [csvCell(guest.email), csvCell(guest.phone)]
          : []),
        csvCell(guest.category),
        csvCell(guest.plusOnes),
        csvCell(guest.table),
        csvCell(STATUS_LABEL[guest.status] ?? guest.status),
        csvCell(guest.checkedInAt ? formatDateTime(guest.checkedInAt) : ""),
        csvCell(guest.checkedInBy?.name ?? ""),
      ].join(","),
    );
  }

  const csv = `\uFEFF${lines.join("\r\n")}`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="invitados.csv"',
      "Cache-Control": "no-store",
    },
  });
}
