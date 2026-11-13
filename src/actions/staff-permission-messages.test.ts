import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  requireOwner: vi.fn(),
  getActiveStaff: vi.fn(),
  searchGuestsForStaff: vi.fn(),
  guestFindFirst: vi.fn(),
}))

vi.mock('@/auth', () => ({ auth: mocks.auth }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/queries/staff', () => ({
  getActiveStaff: mocks.getActiveStaff,
}))
vi.mock('@/lib/queries/guests', () => ({
  searchGuestsForStaff: mocks.searchGuestsForStaff,
}))
vi.mock('@/lib/prisma', () => ({
  default: { guest: { findFirst: mocks.guestFindFirst } },
}))
// The real resolver: this suite pins the message every adopter returns.
vi.mock('@/lib/session', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/session')>('@/lib/session')
  return { ...actual, requireOwner: mocks.requireOwner }
})

import { undoCheckIn } from './checkin'
import { updateGuest } from './guests'

const DEACTIVATED = 'Tu acceso está inactivo'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.auth.mockResolvedValue({
    user: {
      id: 's1',
      name: 'Carla',
      email: 'carla@ejemplo.com',
      role: 'STAFF',
      staffId: 's1',
      eventId: 'e1',
      organizationId: 'o1',
      staffSessionVersion: 2,
    },
  })
  // The staff code was deactivated or its session version was bumped.
  mocks.getActiveStaff.mockResolvedValue(null)
})

describe('a deactivated staff token is refused with the inactive message', () => {
  it('refuses to undo a check-in and looks the guest up only after authorizing', async () => {
    const result = await undoCheckIn('guest-1')

    expect(result.error).toBe(DEACTIVATED)
    expect(mocks.guestFindFirst).not.toHaveBeenCalled()
  })

  it('refuses to update a guest and never reaches the guest lookup', async () => {
    const result = await updateGuest('guest-1', { name: 'Ana' })

    expect(result.error).toBe(DEACTIVATED)
    expect(mocks.guestFindFirst).not.toHaveBeenCalled()
  })
})
