import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getActiveStaff: vi.fn(),
  searchGuestsForStaff: vi.fn(),
  transaction: vi.fn(),
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
  default: {
    $transaction: mocks.transaction,
    guest: { findFirst: mocks.guestFindFirst },
  },
}))

import { checkInGuest, searchGuests, undoCheckIn } from './checkin'

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
    canUndoCheckIn: false,
    event: { status: 'ACTIVE' },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.auth.mockResolvedValue(staffSession)
  mocks.getActiveStaff.mockResolvedValue(activeStaff())
  mocks.searchGuestsForStaff.mockResolvedValue([])
})

describe('door access', () => {
  it('does not search guests for staff without the check-in permission', async () => {
    mocks.getActiveStaff.mockResolvedValue(activeStaff({ canCheckIn: false }))

    await expect(searchGuests('Lucía')).resolves.toEqual([])
    expect(mocks.searchGuestsForStaff).not.toHaveBeenCalled()
  })

  it('does not check in a guest for staff without the check-in permission', async () => {
    mocks.getActiveStaff.mockResolvedValue(activeStaff({ canCheckIn: false }))

    const result = await checkInGuest('guest-1')

    expect(result.error).toBe('No tienes permiso para hacer check-in')
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it('does not search guests when the event is closed', async () => {
    mocks.getActiveStaff.mockResolvedValue(
      activeStaff({ event: { status: 'CLOSED' } }),
    )

    await expect(searchGuests('Lucía')).resolves.toEqual([])
    expect(mocks.searchGuestsForStaff).not.toHaveBeenCalled()
  })

  it('does not check in a guest when the event is closed', async () => {
    mocks.getActiveStaff.mockResolvedValue(
      activeStaff({ event: { status: 'CLOSED' } }),
    )

    const result = await checkInGuest('guest-1')

    expect(result.error).toBe('El evento está cerrado')
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it('does not look up a guest when staff cannot undo check-ins', async () => {
    mocks.getActiveStaff.mockResolvedValue(
      activeStaff({ canUndoCheckIn: false }),
    )

    const result = await undoCheckIn('guest-1')

    expect(result.error).toBe('No tienes permiso para deshacer check-ins')
    expect(mocks.guestFindFirst).not.toHaveBeenCalled()
  })

  it('still lets a guard with permission search the list', async () => {
    mocks.searchGuestsForStaff.mockResolvedValue([
      {
        id: 'guest-1',
        code: 'INV-TEST0001',
        name: 'Lucía Fernández',
        category: 'VIP',
        plusOnes: 0,
        status: 'INVITED',
        checkedInAt: null,
        email: null,
        phone: null,
        table: 'Mesa 1',
        notes: null,
        checkedInBy: null,
      },
    ])

    const result = await searchGuests('Lucía')

    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Lucía Fernández')
  })
})
