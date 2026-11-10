import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireOwner: mocks.requireOwner }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: { staff: { findFirst: mocks.findFirst, update: mocks.update } },
}))

import { DEMO_READ_ONLY_MESSAGE } from '@/lib/demo'
import { regenerateStaffCode, setStaffActive } from './staff'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('demo organization is read-only', () => {
  it('refuses to regenerate a staff code', async () => {
    mocks.requireOwner.mockResolvedValue({
      userId: 'u1',
      name: 'Demo',
      email: 'demo@event-roll.dev',
      organizationId: 'o1',
    })
    mocks.findFirst.mockResolvedValue({ id: 's1', eventId: 'e1' })

    const result = await regenerateStaffCode('s1')

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('refuses to deactivate a staff member', async () => {
    mocks.requireOwner.mockResolvedValue({
      userId: 'u1',
      name: 'Demo',
      email: 'demo@event-roll.dev',
      organizationId: 'o1',
    })
    mocks.findFirst.mockResolvedValue({ id: 's1', eventId: 'e1' })

    const result = await setStaffActive('s1', false)

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.update).not.toHaveBeenCalled()
  })
})
