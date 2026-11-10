import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  getEventForOwner: vi.fn(),
  deleteRow: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireOwner: mocks.requireOwner }))
vi.mock('@/lib/queries/events', () => ({
  getEventForOwner: mocks.getEventForOwner,
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: { event: { delete: mocks.deleteRow } },
}))

import { DEMO_READ_ONLY_MESSAGE } from '@/lib/demo'
import { deleteEvent } from './events'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('deleteEvent', () => {
  it('refuses to delete the public demo event', async () => {
    mocks.requireOwner.mockResolvedValue({
      userId: 'u1',
      name: 'Demo',
      email: 'demo@event-roll.dev',
      organizationId: 'o1',
    })
    mocks.getEventForOwner.mockResolvedValue({ id: 'e1' })

    const result = await deleteEvent('e1')

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.deleteRow).not.toHaveBeenCalled()
  })

  it('still deletes an event for any other organizer', async () => {
    mocks.requireOwner.mockResolvedValue({
      userId: 'u2',
      name: 'Cliente',
      email: 'cliente@ejemplo.com',
      organizationId: 'o2',
    })
    mocks.getEventForOwner.mockResolvedValue({ id: 'e2' })

    const result = await deleteEvent('e2')

    expect(result.success).toBe(true)
    expect(mocks.deleteRow).toHaveBeenCalledWith({ where: { id: 'e2' } })
  })
})
