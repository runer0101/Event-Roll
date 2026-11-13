import prisma from '@/lib/prisma'
import { getEventAttendance, type EventAttendance } from '@/lib/queries/events'
import { formatTime } from '@/lib/utils'

export type LiveFeedItem = {
  id: string
  guestId: string | null
  guestName: string
  category: string | null
  action: 'CHECK_IN' | 'UNDO_CHECK_IN'
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
  stats: EventAttendance
  recent: LiveFeedItem[]
  staff: LiveStaffItem[]
  updatedAt: string
}

export async function getLiveData(
  eventId: string,
  organizationId: string,
): Promise<LiveData> {
  const [attendance, recent, staff] = await Promise.all([
    getEventAttendance(eventId, organizationId),
    prisma.accessLog.findMany({
      where: {
        eventId,
        organizationId,
        action: { in: ['CHECK_IN', 'UNDO_CHECK_IN'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        guest: { select: { id: true, category: true } },
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
    stats: attendance,
    recent: recent.map((log) => ({
      id: log.id,
      guestId: log.guest?.id ?? null,
      guestName: log.guestName,
      category: log.guest?.category ?? null,
      action: log.action,
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
