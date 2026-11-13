import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getEventForOwner: vi.fn(),
  resolveStaff: vi.fn(),
  guestFindMany: vi.fn(),
}))

vi.mock('@/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/queries/events', () => ({
  getEventForOwner: mocks.getEventForOwner,
}))
vi.mock('@/lib/session', () => ({ resolveStaff: mocks.resolveStaff }))
vi.mock('@/lib/prisma', () => ({
  default: { guest: { findMany: mocks.guestFindMany } },
}))

import { GET } from './route'

const STAFF = {
  role: 'STAFF',
  staffId: 's1',
  eventId: 'e1',
  organizationId: 'o1',
  staffSessionVersion: 1,
}

function request(eventId: string) {
  return GET(new Request('http://localhost/export'), {
    params: Promise.resolve({ eventId }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.auth.mockResolvedValue({ user: STAFF })
  mocks.getEventForOwner.mockResolvedValue({ id: 'e1', organizationId: 'o1' })
})

describe('GET export', () => {
  it('refuses a staff token scoped to another event', async () => {
    mocks.getEventForOwner.mockResolvedValue({ id: 'e2', organizationId: 'o1' })

    const response = await request('e2')

    expect(response.status).toBe(403)
    expect(mocks.resolveStaff).not.toHaveBeenCalled()
    expect(mocks.guestFindMany).not.toHaveBeenCalled()
  })

  it('refuses a deactivated staff token for its own event', async () => {
    mocks.resolveStaff.mockResolvedValue({
      ok: false,
      error: 'Tu acceso está inactivo',
    })

    const response = await request('e1')

    expect(response.status).toBe(403)
    expect(mocks.guestFindMany).not.toHaveBeenCalled()
  })

  it('refuses staff without the export permission', async () => {
    mocks.resolveStaff.mockResolvedValue({
      ok: true,
      staff: { id: 's1', canExport: false, canViewContact: true },
    })

    const response = await request('e1')

    expect(response.status).toBe(403)
    expect(mocks.guestFindMany).not.toHaveBeenCalled()
  })

  it('exports the event for an owning staff token with the permission', async () => {
    mocks.resolveStaff.mockResolvedValue({
      ok: true,
      staff: { id: 's1', canExport: true, canViewContact: false },
    })
    mocks.guestFindMany.mockResolvedValue([])

    const response = await request('e1')

    expect(response.status).toBe(200)
    expect(mocks.guestFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: 'e1', organizationId: 'o1' },
      }),
    )
  })
})
