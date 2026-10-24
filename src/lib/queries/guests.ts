import prisma from '@/lib/prisma'
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
  if (value.length < 1) return []

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

export async function getRecentCheckInsForStaff(
  staffId: string,
  eventId: string,
  organizationId: string,
) {
  return prisma.accessLog.findMany({
    where: {
      staffId,
      eventId,
      organizationId,
      action: 'CHECK_IN',
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: { id: true, guestName: true, createdAt: true },
  })
}
