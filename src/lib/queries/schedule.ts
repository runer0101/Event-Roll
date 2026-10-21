import prisma from '@/lib/prisma'
import type { ScheduleStatus } from '@/generated/prisma/enums'

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

export async function getSchedulePreview(
  eventId: string,
  organizationId: string,
  limit = 4,
) {
  return prisma.scheduleItem.findMany({
    where: {
      eventId,
      organizationId,
      status: 'PENDING' as ScheduleStatus,
    },
    orderBy: { startAt: 'asc' },
    take: limit,
    include: { assignee: { select: { name: true, role: true } } },
  })
}
