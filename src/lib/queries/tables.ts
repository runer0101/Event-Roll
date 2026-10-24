import prisma from '@/lib/prisma'

export async function getTablesForEvent(
  eventId: string,
  organizationId: string,
) {
  return prisma.eventTable.findMany({
    where: { eventId, organizationId },
    orderBy: { name: 'asc' },
    include: {
      chairs: { orderBy: { number: 'asc' } },
    },
  })
}
