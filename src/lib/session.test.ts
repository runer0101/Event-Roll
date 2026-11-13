import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ getActiveStaff: vi.fn() }))

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/queries/staff', () => ({ getActiveStaff: mocks.getActiveStaff }))

import { resolveStaff } from './session'

const STAFF_USER = {
  role: 'STAFF',
  staffId: 's1',
  eventId: 'e1',
  organizationId: 'o1',
  staffSessionVersion: 3,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('resolveStaff', () => {
  it('returns the active staff row for a staff session', async () => {
    mocks.getActiveStaff.mockResolvedValue({ id: 's1', canCheckIn: true })

    const result = await resolveStaff(STAFF_USER)

    expect(result).toEqual({ ok: true, staff: { id: 's1', canCheckIn: true } })
    expect(mocks.getActiveStaff).toHaveBeenCalledWith('s1', 'e1', 'o1', 3)
  })

  it('refuses an anonymous or owner session without querying', async () => {
    expect(await resolveStaff(undefined)).toEqual({
      ok: false,
      error: 'No autorizado',
    })
    expect(await resolveStaff({ ...STAFF_USER, role: 'OWNER' })).toEqual({
      ok: false,
      error: 'No autorizado',
    })
    expect(mocks.getActiveStaff).not.toHaveBeenCalled()
  })

  it('reports an inactive staff code instead of calling it unauthorized', async () => {
    mocks.getActiveStaff.mockResolvedValue(null)

    expect(await resolveStaff(STAFF_USER)).toEqual({
      ok: false,
      error: 'Tu acceso está inactivo',
    })
  })

  it('treats a token without a session version as stale', async () => {
    mocks.getActiveStaff.mockResolvedValue({ id: 's1' })

    await resolveStaff({ ...STAFF_USER, staffSessionVersion: undefined })

    expect(mocks.getActiveStaff).toHaveBeenCalledWith('s1', 'e1', 'o1', -1)
  })
})
