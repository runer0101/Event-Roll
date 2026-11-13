import prisma from '@/lib/prisma'

export async function getScheduleForEvent(
  eventId: string,
  organizationId: string,
) {
  return prisma.scheduleItem.findMany({
    where: { eventId, organizationId },
    orderBy: { startAt: 'asc' },
    include: {
      assignee: { select: { id: true, name: true, role: true } },
    },
  })
}

export async function getScheduleForStaff(
  staffId: string,
  eventId: string,
  organizationId: string,
) {
  return prisma.scheduleItem.findMany({
    where: { eventId, organizationId, assigneeId: staffId },
    orderBy: { startAt: 'asc' },
    include: {
      assignee: { select: { id: true, name: true, role: true } },
    },
  })
}
