import prisma from '@/lib/prisma'

export async function getStaffForEvent(
  eventId: string,
  organizationId: string,
) {
  return prisma.staff.findMany({
    where: { eventId, organizationId },
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    include: {
      _count: { select: { checkIns: true } },
      checkIns: {
        select: { checkedInAt: true },
        orderBy: { checkedInAt: 'desc' },
        take: 1,
      },
    },
  })
}

export async function getActiveStaff(
  staffId: string,
  eventId: string,
  organizationId: string,
) {
  return prisma.staff.findFirst({
    where: {
      id: staffId,
      eventId,
      organizationId,
      active: true,
    },
    include: { event: true },
  })
}

export async function getStaffForSession(staffId: string) {
  return prisma.staff.findUnique({
    where: { id: staffId },
    include: { event: true },
  })
}
