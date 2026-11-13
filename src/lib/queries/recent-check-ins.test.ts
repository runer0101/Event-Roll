import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  accessLogFindMany: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: { accessLog: { findMany: mocks.accessLogFindMany } },
}))

import { getRecentCheckInsForStaff } from './guests'

function log(
  id: string,
  guestId: string,
  action: 'CHECK_IN' | 'UNDO_CHECK_IN',
  minutesAgo: number,
) {
  return {
    id,
    guestId,
    guestName: `Invitado ${guestId}`,
    action,
    createdAt: new Date(Date.UTC(2026, 0, 1, 22, 0 - minutesAgo)),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getRecentCheckInsForStaff', () => {
  it('hides an entry the guard just undid', async () => {
    mocks.accessLogFindMany.mockResolvedValue([
      log('l3', 'g1', 'UNDO_CHECK_IN', 0),
      log('l2', 'g2', 'CHECK_IN', 1),
      log('l1', 'g1', 'CHECK_IN', 2),
    ])

    const recent = await getRecentCheckInsForStaff('s1', 'e1', 'o1')

    expect(recent.map((item) => item.guestName)).toEqual(['Invitado g2'])
  })

  it('shows a guest once when the same guard checked them in again', async () => {
    mocks.accessLogFindMany.mockResolvedValue([
      log('l4', 'g1', 'CHECK_IN', 0),
      log('l3', 'g1', 'UNDO_CHECK_IN', 1),
      log('l2', 'g1', 'CHECK_IN', 2),
    ])

    const recent = await getRecentCheckInsForStaff('s1', 'e1', 'o1')

    expect(recent.map((item) => item.id)).toEqual(['l4'])
  })

  it('keeps at most eight entries', async () => {
    mocks.accessLogFindMany.mockResolvedValue(
      Array.from({ length: 12 }, (_, index) =>
        log(`l${index}`, `g${index}`, 'CHECK_IN', index),
      ),
    )

    const recent = await getRecentCheckInsForStaff('s1', 'e1', 'o1')

    expect(recent).toHaveLength(8)
    expect(recent[0]?.id).toBe('l0')
  })
})
