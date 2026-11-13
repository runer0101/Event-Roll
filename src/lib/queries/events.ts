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

export async function getEventsForOwner(organizationId: string) {
  const events = await prisma.event.findMany({
    where: { organizationId },
    orderBy: { date: 'asc' },
    include: {
      _count: { select: { guests: true, staff: true } },
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
  const [total, checkedIn, staff] = await Promise.all([
    prisma.guest.count({
      where: { eventId, organizationId, status: { not: 'CANCELLED' } },
    }),
    prisma.guest.count({
      where: { eventId, organizationId, status: 'CHECKED_IN' },
    }),
    prisma.staff.count({
      where: { eventId, organizationId, active: true },
    }),
  ])

  return { total, checkedIn, pending: total - checkedIn, staff }
}
