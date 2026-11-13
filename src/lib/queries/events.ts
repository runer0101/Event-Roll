import prisma from '@/lib/prisma'

export async function getOrganizationForOwner(ownerId: string) {
  return prisma.organization.findUnique({
    where: { ownerId },
    include: { _count: { select: { events: true } } },
  })
}

export async function getEventForOwner(
  eventId: string,
  organizationId: string,
) {
  return prisma.event.findFirst({
    where: { id: eventId, organizationId },
  })
}

/**
 * A single percentage for every surface that shows attendance progress: the
 * dashboard, the live panel and the guard counters all count the same guests.
 */
export function progressRate(checkedIn: number, countedGuests: number): number {
  return countedGuests <= 0 ? 0 : Math.round((checkedIn / countedGuests) * 100)
}

export type EventAttendance = {
  total: number
  checkedIn: number
  pending: number
  rate: number
}

/**
 * The one attendance definition shared by the dashboard, the live panel and
 * the guard counters. Cancelled invitations never reach the denominator, and
 * `pending` is the number of guests still holding an invitation.
 */
export async function getEventAttendance(
  eventId: string,
  organizationId: string,
): Promise<EventAttendance> {
  const [total, checkedIn, pending] = await Promise.all([
    prisma.guest.count({
      where: { eventId, organizationId, status: { not: 'CANCELLED' } },
    }),
    prisma.guest.count({
      where: { eventId, organizationId, status: 'CHECKED_IN' },
    }),
    prisma.guest.count({
      where: { eventId, organizationId, status: 'INVITED' },
    }),
  ])

  return { total, checkedIn, pending, rate: progressRate(checkedIn, total) }
}

export async function getEventsForOwner(organizationId: string) {
  const events = await prisma.event.findMany({
    where: { organizationId },
    orderBy: { date: 'asc' },
    include: {
      // Only the staff count is displayed per event; guest totals come from
      // `countedGuests` so cancelled invitations never reach the card.
      _count: { select: { staff: true } },
    },
  })

  if (events.length === 0) return []

  const grouped = await prisma.guest.groupBy({
    by: ['eventId', 'status'],
    where: {
      organizationId,
      eventId: { in: events.map((event) => event.id) },
    },
    _count: { _all: true },
  })

  const checkedByEvent = new Map<string, number>()
  const countedByEvent = new Map<string, number>()
  for (const row of grouped) {
    const count = row._count._all
    if (row.status === 'CHECKED_IN') checkedByEvent.set(row.eventId, count)
    // Cancelled invitations are not part of the attendance denominator.
    if (row.status !== 'CANCELLED') {
      countedByEvent.set(
        row.eventId,
        (countedByEvent.get(row.eventId) ?? 0) + count,
      )
    }
  }

  return events.map((event) => ({
    ...event,
    checkedIn: checkedByEvent.get(event.id) ?? 0,
    countedGuests: countedByEvent.get(event.id) ?? 0,
  }))
}

export async function getEventCounters(
  eventId: string,
  organizationId: string,
) {
  const [attendance, staff] = await Promise.all([
    getEventAttendance(eventId, organizationId),
    prisma.staff.count({
      where: { eventId, organizationId, active: true },
    }),
  ])

  return { ...attendance, staff }
}
