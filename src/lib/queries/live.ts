import prisma from '@/lib/prisma'
import { formatTime } from '@/lib/utils'

export type LiveFeedItem = {
  id: string
  guestId: string
  guestName: string
  category: string | null
  staffName: string
  at: string
  atLabel: string
}

export type LiveStaffItem = {
  id: string
  name: string
  checkIns: number
  lastAt: string | null
  lastLabel: string | null
}

export type LiveData = {
  stats: {
    total: number
    checkedIn: number
    pending: number
    rate: number
  }
  recent: LiveFeedItem[]
  staff: LiveStaffItem[]
  updatedAt: string
}

export async function getLiveData(
  eventId: string,
  organizationId: string,
): Promise<LiveData> {
  const [total, checkedIn, recent, staff] = await Promise.all([
    prisma.guest.count({
      where: { eventId, organizationId, status: { not: 'CANCELLED' } },
    }),
    prisma.guest.count({
      where: { eventId, organizationId, status: 'CHECKED_IN' },
    }),
    prisma.accessLog.findMany({
      where: { eventId, organizationId, action: 'CHECK_IN' },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        guest: { select: { id: true, name: true, category: true } },
        staff: { select: { name: true } },
      },
    }),
    prisma.staff.findMany({
      where: { eventId, organizationId, active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        _count: { select: { checkIns: true } },
        checkIns: {
          select: { checkedInAt: true },
          orderBy: { checkedInAt: 'desc' },
          take: 1,
        },
      },
    }),
  ])

  return {
    stats: {
      total,
      checkedIn,
      pending: total - checkedIn,
      rate: total === 0 ? 0 : Math.round((checkedIn / total) * 100),
    },
    recent: recent.map((log) => ({
      id: log.id,
      guestId: log.guest.id,
      guestName: log.guest.name,
      category: log.guest.category,
      staffName: log.staff?.name ?? 'Sistema',
      at: log.createdAt.toISOString(),
      atLabel: formatTime(log.createdAt),
    })),
    staff: staff.map((member) => {
      const last = member.checkIns[0]?.checkedInAt ?? null
      return {
        id: member.id,
        name: member.name,
        checkIns: member._count.checkIns,
        lastAt: last ? last.toISOString() : null,
        lastLabel: last ? formatTime(last) : null,
      }
    }),
    updatedAt: new Date().toISOString(),
  }
}
