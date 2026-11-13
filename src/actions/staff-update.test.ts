import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  staffFindFirst: vi.fn(),
  staffUpdate: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireOwner: mocks.requireOwner }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: { staff: { findFirst: mocks.staffFindFirst, update: mocks.staffUpdate } },
}))

import { updateStaff } from './staff'

const OWNER = {
  userId: 'u2',
  name: 'Cliente',
  email: 'cliente@ejemplo.com',
  organizationId: 'o2',
}

function updateData() {
  const call = mocks.staffUpdate.mock.calls[0]?.[0] as
    | { data: Record<string, unknown> }
    | undefined
  return call?.data ?? {}
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requireOwner.mockResolvedValue(OWNER)
  mocks.staffFindFirst.mockResolvedValue({
    id: 's1',
    eventId: 'e1',
    name: 'Luis',
    role: 'GUARD',
    canViewContact: true,
    canEditGuests: true,
  })
  mocks.staffUpdate.mockResolvedValue({ id: 's1' })
})

describe('updateStaff keeps the permissions the payload omits', () => {
  it('does not rewrite omitted permissions to false', async () => {
    const result = await updateStaff('s1', {
      name: 'Luis',
      role: 'GUARD',
      canExport: true,
    })

    expect(result.success).toBe(true)
    const data = updateData()
    expect(data).toEqual({ name: 'Luis', role: 'GUARD', canExport: true })
    expect(data).not.toHaveProperty('canViewContact')
    expect(data).not.toHaveProperty('canEditGuests')
    expect(data).not.toHaveProperty('canUndoCheckIn')
    expect(data).not.toHaveProperty('canViewStats')
  })

  it('keeps the stored role when the payload omits it', async () => {
    await updateStaff('s1', { name: 'Luis', canViewContact: true })

    expect(updateData()).toEqual({ name: 'Luis', canViewContact: true })
    expect(updateData()).not.toHaveProperty('role')
  })

  it('still writes every field of a complete payload', async () => {
    await updateStaff('s1', {
      name: 'Luis',
      role: 'COORDINATOR',
      canCheckIn: false,
      canViewContact: false,
      canEditGuests: true,
      canExport: false,
      canUndoCheckIn: true,
      canViewStats: true,
    })

    expect(updateData()).toEqual({
      name: 'Luis',
      role: 'COORDINATOR',
      canCheckIn: false,
      canViewContact: false,
      canEditGuests: true,
      canExport: false,
      canUndoCheckIn: true,
      canViewStats: true,
    })
  })

  it('still rejects a payload with an empty name', async () => {
    const result = await updateStaff('s1', { name: '  ', canExport: true })

    expect(result.error).toBe('Escribe el nombre del ayudante')
    expect(mocks.staffUpdate).not.toHaveBeenCalled()
  })
})
