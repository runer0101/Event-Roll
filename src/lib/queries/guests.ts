import prisma from '@/lib/prisma'
import { isSearchableQuery } from '@/lib/guests'
import { normalizeText } from '@/lib/utils'
import type { GuestStatus } from '@/generated/prisma/enums'

const PAGE_SIZE = 25

export type GuestFilters = {
  query?: string
  status?: GuestStatus | 'ALL'
  page?: number
}

export async function getGuestsPage(
  eventId: string,
  organizationId: string,
  filters: GuestFilters = {},
) {
  const query = filters.query?.trim() ?? ''
  const status = filters.status && filters.status !== 'ALL' ? filters.status : undefined
  const page = Math.max(1, filters.page ?? 1)

  const where = {
    eventId,
    organizationId,
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { searchName: { contains: normalizeText(query) } },
            { email: { contains: query, mode: 'insensitive' as const } },
            { phone: { contains: query } },
            { code: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [guests, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { checkedInBy: { select: { name: true } } },
    }),
    prisma.guest.count({ where }),
  ])

  return {
    guests,
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export async function searchGuestsForStaff(
  eventId: string,
  organizationId: string,
  query: string,
  includeContact: boolean,
  includeEditData: boolean,
) {
  const value = query.trim()
  if (!isSearchableQuery(value)) return []

  const search = [
    { searchName: { contains: normalizeText(value) } },
    { code: { contains: value, mode: 'insensitive' as const } },
    ...(includeContact
      ? [
          { email: { contains: value, mode: 'insensitive' as const } },
          { phone: { contains: value } },
        ]
      : []),
  ]

  return prisma.guest.findMany({
    where: { eventId, organizationId, OR: search },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
    take: 25,
    select: {
      id: true,
      code: true,
      name: true,
      category: true,
      plusOnes: true,
      status: true,
      checkedInAt: true,
      email: includeContact,
      phone: includeContact,
      table: includeEditData,
      notes: includeEditData,
      checkedInBy: { select: { name: true } },
    },
  })
}

const RECENT_CHECK_IN_LIMIT = 8
// Entries are folded per guest below, so the scan reads past the visible window
// to keep eight real entries when some of them were undone.
const RECENT_CHECK_IN_SCAN = 40

export async function getRecentCheckInsForStaff(
  staffId: string,
  eventId: string,
  organizationId: string,
) {
  const logs = await prisma.accessLog.findMany({
    where: {
      staffId,
      eventId,
      organizationId,
      action: { in: ['CHECK_IN', 'UNDO_CHECK_IN'] },
    },
    orderBy: { createdAt: 'desc' },
    take: RECENT_CHECK_IN_SCAN,
    select: {
      id: true,
      guestId: true,
      guestName: true,
      createdAt: true,
      action: true,
    },
  })

  const recent: Array<{
    id: string
    guestName: string
    createdAt: Date
  }> = []
  const seen = new Set<string>()

  for (const log of logs) {
    // The newest entry per guest decides: an undo hides the check-in it
    // reverted, and a later check-in replaces the undone one.
    const key = log.guestId ?? log.id
    if (seen.has(key)) continue
    seen.add(key)
    if (log.action !== 'CHECK_IN') continue
    recent.push({
      id: log.id,
      guestName: log.guestName,
      createdAt: log.createdAt,
    })
    if (recent.length === RECENT_CHECK_IN_LIMIT) break
  }

  return recent
}
