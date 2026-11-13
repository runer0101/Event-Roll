import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  getEventForOwner: vi.fn(),
  createRow: vi.fn(),
  updateRow: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireOwner: mocks.requireOwner }))
vi.mock('@/lib/queries/events', () => ({
  getEventForOwner: mocks.getEventForOwner,
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: { event: { create: mocks.createRow, update: mocks.updateRow } },
}))

import { createEvent, updateEvent } from './events'

const OWNER = {
  userId: 'u1',
  name: 'Ana',
  email: 'ana@ejemplo.com',
  organizationId: 'o1',
}
const PAST = '2020-01-01T20:00:00Z'
const FUTURE = '2030-01-01T20:00:00Z'
const MESSAGE = 'La fecha del evento debe ser futura'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requireOwner.mockResolvedValue(OWNER)
  mocks.getEventForOwner.mockResolvedValue({ id: 'e1' })
})

describe('an event date is never in the past', () => {
  it('refuses to create an event in the past', async () => {
    const result = await createEvent({
      name: 'Boda',
      date: PAST,
      location: 'Salón',
    })

    expect(result.error).toBe(MESSAGE)
    expect(mocks.createRow).not.toHaveBeenCalled()
  })

  it('refuses to move an existing event into the past', async () => {
    const result = await updateEvent('e1', {
      name: 'Boda',
      date: PAST,
      location: 'Salón',
    })

    expect(result.error).toBe(MESSAGE)
    expect(mocks.updateRow).not.toHaveBeenCalled()
  })

  it('still saves a future date', async () => {
    mocks.updateRow.mockResolvedValue({ id: 'e1' })

    const result = await updateEvent('e1', {
      name: 'Boda',
      date: FUTURE,
      location: 'Salón',
    })

    expect(result.success).toBe(true)
    expect(mocks.updateRow).toHaveBeenCalled()
  })
})
