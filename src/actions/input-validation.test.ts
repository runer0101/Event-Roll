import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  requireOwner: vi.fn(),
  getActiveStaff: vi.fn(),
  searchGuestsForStaff: vi.fn(),
  transaction: vi.fn(),
  guestFindFirst: vi.fn(),
  guestDelete: vi.fn(),
  guestUpdateMany: vi.fn(),
  staffFindFirst: vi.fn(),
  staffUpdate: vi.fn(),
}))

vi.mock('@/auth', () => ({ auth: mocks.auth }))
// Keep the real resolveStaff: it must run against the mocked staff query, so
// this suite still exercises the shared authorization path end to end.
vi.mock('@/lib/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/session')>('@/lib/session')
  return { ...actual, requireOwner: mocks.requireOwner }
})
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/queries/staff', () => ({
  getActiveStaff: mocks.getActiveStaff,
}))
vi.mock('@/lib/queries/guests', () => ({
  searchGuestsForStaff: mocks.searchGuestsForStaff,
}))
vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: mocks.transaction,
    guest: {
      findFirst: mocks.guestFindFirst,
      delete: mocks.guestDelete,
      updateMany: mocks.guestUpdateMany,
    },
    staff: { findFirst: mocks.staffFindFirst, update: mocks.staffUpdate },
  },
}))

import { checkInGuest, searchGuests, undoCheckIn } from './checkin'
import { deleteGuest } from './guests'
import { setStaffActive } from './staff'

const OWNER = {
  userId: 'u2',
  name: 'Cliente',
  email: 'cliente@ejemplo.com',
  organizationId: 'o2',
}

const staffSession = {
  user: {
    id: 'staff-1',
    role: 'STAFF' as const,
    staffId: 'staff-1',
    eventId: 'event-1',
    organizationId: 'org-1',
    staffSessionVersion: 0,
  },
}

function activeStaff(overrides: Record<string, unknown> = {}) {
  return {
    id: 'staff-1',
    eventId: 'event-1',
    organizationId: 'org-1',
    active: true,
    canCheckIn: true,
    canViewContact: false,
    canEditGuests: false,
    canUndoCheckIn: true,
    event: { status: 'ACTIVE' },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.auth.mockResolvedValue(staffSession)
  mocks.requireOwner.mockResolvedValue(OWNER)
  mocks.getActiveStaff.mockResolvedValue(activeStaff())
  mocks.searchGuestsForStaff.mockResolvedValue([])
})

describe('malformed input is handled before it reaches Prisma', () => {
  it('searchGuests returns an empty result instead of throwing', async () => {
    const result = await searchGuests({ query: 'Lucía' } as unknown as string)

    expect(result).toEqual([])
    expect(mocks.searchGuestsForStaff).not.toHaveBeenCalled()
  })

  it('checkInGuest refuses a guest id that is not a string', async () => {
    const result = await checkInGuest({ id: 'g1' } as unknown as string)

    expect(result.error).toBe('Invitado inválido')
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it('undoCheckIn refuses an empty guest id', async () => {
    const result = await undoCheckIn('   ')

    expect(result.error).toBe('Invitado inválido')
    expect(mocks.guestFindFirst).not.toHaveBeenCalled()
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it('deleteGuest refuses a guest id that is not a string', async () => {
    const result = await deleteGuest(null as unknown as string)

    expect(result.error).toBe('Invitado inválido')
    expect(mocks.guestFindFirst).not.toHaveBeenCalled()
    expect(mocks.guestDelete).not.toHaveBeenCalled()
  })

  it('setStaffActive refuses a non-boolean active flag', async () => {
    const result = await setStaffActive('s1', 'false' as unknown as boolean)

    expect(result.error).toBe('Estado inválido')
    expect(mocks.staffFindFirst).not.toHaveBeenCalled()
    expect(mocks.staffUpdate).not.toHaveBeenCalled()
  })

  it('setStaffActive refuses a staff id that is not a string', async () => {
    const result = await setStaffActive(42 as unknown as string, true)

    expect(result.error).toBe('Estado inválido')
    expect(mocks.staffUpdate).not.toHaveBeenCalled()
  })
})

describe('well-formed input keeps working', () => {
  it('searchGuests still queries the guest list', async () => {
    await searchGuests('Lucía')

    expect(mocks.searchGuestsForStaff).toHaveBeenCalled()
  })

  it('undoCheckIn still undoes an active entry', async () => {
    mocks.guestFindFirst.mockResolvedValue({
      id: 'g1',
      name: 'Ana Vega',
      eventId: 'event-1',
      organizationId: 'org-1',
      status: 'CHECKED_IN',
    })
    mocks.transaction.mockImplementation(async (fn: (tx: unknown) => unknown) =>
      fn({
        guest: { updateMany: mocks.guestUpdateMany },
        accessLog: { create: vi.fn() },
      }),
    )
    mocks.guestUpdateMany.mockResolvedValue({ count: 1 })

    const result = await undoCheckIn('g1')

    expect(result.success).toBe(true)
    expect(mocks.guestUpdateMany).toHaveBeenCalled()
  })

  it('setStaffActive still toggles a staff member', async () => {
    mocks.staffFindFirst.mockResolvedValue({ id: 's1', eventId: 'e1' })
    mocks.staffUpdate.mockResolvedValue({ id: 's1' })

    const result = await setStaffActive('s1', false)

    expect(result.success).toBe(true)
    expect(mocks.staffUpdate).toHaveBeenCalled()
  })
})
