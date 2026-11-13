import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  getEventForOwner: vi.fn(),
  revalidatePath: vi.fn(),
  tableCreate: vi.fn(),
  tableFindFirst: vi.fn(),
  tableDelete: vi.fn(),
  chairFindFirst: vi.fn(),
  chairUpdateMany: vi.fn(),
  chairUpdate: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireOwner: mocks.requireOwner }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/lib/queries/events', () => ({
  getEventForOwner: mocks.getEventForOwner,
}))
vi.mock('@/lib/prisma', () => ({
  default: {
    eventTable: {
      create: mocks.tableCreate,
      findFirst: mocks.tableFindFirst,
      delete: mocks.tableDelete,
    },
    chair: {
      findFirst: mocks.chairFindFirst,
      updateMany: mocks.chairUpdateMany,
      update: mocks.chairUpdate,
    },
  },
}))

import { DEMO_READ_ONLY_MESSAGE } from '@/lib/demo'
import { createTable, toggleChair } from './tables'

const OWNER = {
  userId: 'u2',
  name: 'Cliente',
  email: 'cliente@ejemplo.com',
  organizationId: 'o2',
}

const DEMO_OWNER = {
  userId: 'u1',
  name: 'Demo',
  email: 'demo@event-roll.dev',
  organizationId: 'o1',
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requireOwner.mockResolvedValue(OWNER)
  mocks.getEventForOwner.mockResolvedValue({ id: 'e1', status: 'ACTIVE' })
})

describe('the demo organization refuses to create tables', () => {
  beforeEach(() => {
    mocks.requireOwner.mockResolvedValue(DEMO_OWNER)
  })

  it('refuses with the published message instead of writing', async () => {
    const result = await createTable('e1', { name: 'Mesa 7', capacity: 8 })

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.tableCreate).not.toHaveBeenCalled()
  })

  it('never reads the event before refusing', async () => {
    await createTable('e1', { name: 'Mesa 7', capacity: 8 })

    expect(mocks.getEventForOwner).not.toHaveBeenCalled()
  })
})

describe('any other organizer keeps writing', () => {
  it('still creates a table with its chairs', async () => {
    mocks.tableCreate.mockResolvedValue({ id: 't1' })

    const result = await createTable('e1', { name: 'Mesa 7', capacity: 2 })

    expect(result).toEqual({ success: true, tableId: 't1' })
    expect(mocks.tableCreate).toHaveBeenCalledTimes(1)
  })
})

describe('toggleChair rejects malformed identifiers', () => {
  const invalid: Array<[string, unknown]> = [
    ['an empty id', ''],
    ['a blank id', '   '],
    ['an oversized id', 'x'.repeat(65)],
    ['a non-string id', 42],
    ['a missing id', undefined],
    ['a null id', null],
  ]

  for (const [label, value] of invalid) {
    it(`returns a handled error for ${label}`, async () => {
      const result = await toggleChair(value as string)

      expect(result).toEqual({ error: 'Silla inválida' })
      expect(mocks.chairFindFirst).not.toHaveBeenCalled()
      expect(mocks.chairUpdateMany).not.toHaveBeenCalled()
    })
  }

  it('keeps reporting an unknown chair without writing', async () => {
    mocks.chairFindFirst.mockResolvedValue(null)

    const result = await toggleChair('chair-missing')

    expect(result).toEqual({ error: 'Silla no encontrada' })
    expect(mocks.chairUpdateMany).not.toHaveBeenCalled()
  })
})

describe('toggleChair converges with the stored state', () => {
  it('writes only on the state the click saw and reports the new value', async () => {
    mocks.chairFindFirst.mockResolvedValue({
      id: 'c1',
      eventId: 'e1',
      occupied: false,
    })
    mocks.chairUpdateMany.mockResolvedValue({ count: 1 })

    const result = await toggleChair('c1')

    expect(mocks.chairUpdateMany).toHaveBeenCalledWith({
      where: { id: 'c1', organizationId: 'o2', occupied: false },
      data: { occupied: true },
    })
    // No unconditional write is left to flip the row back.
    expect(mocks.chairUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ success: true, occupied: true })
  })

  it('reports the stored value when another writer already changed the chair', async () => {
    // The click saw a free chair; by the time the conditional write lands a
    // second tab has already occupied it, so nothing is written this time.
    mocks.chairFindFirst
      .mockResolvedValueOnce({ id: 'c1', eventId: 'e1', occupied: false })
      .mockResolvedValueOnce({ occupied: true })
    mocks.chairUpdateMany.mockResolvedValue({ count: 0 })

    const result = await toggleChair('c1')

    expect(result).toEqual({ success: true, occupied: true })
    expect(mocks.chairUpdateMany).toHaveBeenCalledTimes(1)
    expect(mocks.chairUpdate).not.toHaveBeenCalled()
  })

  it('refuses to report a state for a chair deleted in the meantime', async () => {
    mocks.chairFindFirst
      .mockResolvedValueOnce({ id: 'c1', eventId: 'e1', occupied: true })
      .mockResolvedValueOnce(null)
    mocks.chairUpdateMany.mockResolvedValue({ count: 0 })

    const result = await toggleChair('c1')

    expect(result).toEqual({ error: 'Silla no encontrada' })
  })
})
