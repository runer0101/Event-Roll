import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getActiveStaff: vi.fn(),
  guestFindFirst: vi.fn(),
  guestUpdate: vi.fn(),
  itemFindFirst: vi.fn(),
  itemUpdate: vi.fn(),
}))

vi.mock('@/auth', () => ({ auth: mocks.auth }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/queries/staff', () => ({
  getActiveStaff: mocks.getActiveStaff,
}))
vi.mock('@/lib/prisma', () => ({
  default: {
    guest: { findFirst: mocks.guestFindFirst, update: mocks.guestUpdate },
    scheduleItem: {
      findFirst: mocks.itemFindFirst,
      update: mocks.itemUpdate,
    },
  },
}))

import { DEMO_READ_ONLY_MESSAGE } from '@/lib/demo'
import { updateGuest } from './guests'
import { toggleScheduleItem } from './schedule'

/**
 * The demo organizer credentials are public, but so is the coordinating staff
 * account the seed creates. A read-only demo has to hold for staff sessions
 * too, not only when the visitor signed in as the owner.
 */
const DEMO_STAFF = {
  userId: 'u2',
  name: 'Coordinación',
  email: 'demo@event-roll.dev',
  role: 'STAFF',
  organizationId: 'o1',
  staffId: 's1',
  eventId: 'e1',
  staffSessionVersion: 1,
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.auth.mockResolvedValue({ user: DEMO_STAFF })
  mocks.getActiveStaff.mockResolvedValue({
    id: 's1',
    eventId: 'e1',
    canEditGuests: true,
    canCheckIn: true,
  })
  mocks.guestFindFirst.mockResolvedValue({ id: 'g1', eventId: 'e1' })
  mocks.guestUpdate.mockResolvedValue({ id: 'g1' })
  mocks.itemFindFirst.mockResolvedValue({ id: 'i1', eventId: 'e1' })
  mocks.itemUpdate.mockResolvedValue({ id: 'i1' })
})

describe('demo staff sessions are read-only too', () => {
  it('refuses a guest edit from the demo staff account', async () => {
    const result = await updateGuest('g1', { name: 'Nombre cambiado', plusOnes: 0 })

    expect(result).toEqual({ error: DEMO_READ_ONLY_MESSAGE })
    expect(mocks.guestUpdate).not.toHaveBeenCalled()
  })

  it('refuses a schedule toggle from the demo staff account', async () => {
    const result = await toggleScheduleItem('i1')

    expect(result).toEqual({ error: DEMO_READ_ONLY_MESSAGE })
    expect(mocks.itemUpdate).not.toHaveBeenCalled()
  })
})
