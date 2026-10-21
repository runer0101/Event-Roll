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

export async function getEventsForOwner(organizationId: string) {
  const events = await prisma.event.findMany({
    where: { organizationId },
    orderBy: { date: 'asc' },
    include: {
      _count: { select: { guests: true, staff: true } },
    },
  })

  if (events.length === 0) return []

  const checkedIn = await prisma.guest.groupBy({
    by: ['eventId'],
    where: {
      organizationId,
      eventId: { in: events.map((event) => event.id) },
      status: 'CHECKED_IN',
    },
    _count: { _all: true },
  })
  const checkedByEvent = new Map(
    checkedIn.map((row) => [row.eventId, row._count._all]),
  )

  return events.map((event) => ({
    ...event,
    checkedIn: checkedByEvent.get(event.id) ?? 0,
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
