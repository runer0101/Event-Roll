import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  guestCount: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: { guest: { count: mocks.guestCount } },
}))

import { getEventAttendance } from '@/lib/queries/events'

// The fake guest list answers each count with the rows the requested `where`
// actually matches, so a missing status filter changes the result.
let guests: string[] = []

function countMatching(where: { status?: unknown }): number {
  const status = where.status
  if (status === undefined) return guests.length
  if (typeof status === 'string') {
    return guests.filter((guest) => guest === status).length
  }
  if (status && typeof status === 'object' && 'not' in status) {
    return guests.filter((guest) => guest !== status.not).length
  }
  throw new Error(`unexpected status filter: ${JSON.stringify(status)}`)
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.guestCount.mockImplementation((args: { where: { status?: unknown } }) =>
    Promise.resolve(countMatching(args.where)),
  )
})

describe('getEventAttendance', () => {
  it('excludes cancelled guests from the total and reports invited pending', async () => {
    guests = ['CHECKED_IN', 'INVITED', 'INVITED', 'CANCELLED']

    await expect(getEventAttendance('e1', 'o1')).resolves.toEqual({
      total: 3,
      checkedIn: 1,
      pending: 2,
      rate: 33,
    })
  })

  it('rounds the rate exactly as the dashboard already does', async () => {
    guests = ['CHECKED_IN', 'INVITED', 'INVITED']

    // 1/3 is 33.33%: the rounded integer, never a fraction.
    await expect(getEventAttendance('e1', 'o1')).resolves.toMatchObject({
      rate: 33,
    })

    guests = ['CHECKED_IN', 'CHECKED_IN', 'INVITED']
    // 2/3 is 66.66% and rounds up to 67.
    await expect(getEventAttendance('e1', 'o1')).resolves.toMatchObject({
      rate: 67,
    })

    guests = ['CHECKED_IN', ...Array.from({ length: 7 }, () => 'INVITED')]
    // 12.5% rounds up to 13, matching Math.round.
    await expect(getEventAttendance('e1', 'o1')).resolves.toMatchObject({
      rate: 13,
    })
  })

  it('returns a zero rate when every guest is cancelled', async () => {
    guests = ['CANCELLED', 'CANCELLED']

    await expect(getEventAttendance('e1', 'o1')).resolves.toEqual({
      total: 0,
      checkedIn: 0,
      pending: 0,
      rate: 0,
    })
  })
})
