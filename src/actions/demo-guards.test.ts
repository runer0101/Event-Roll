import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  tableFindFirst: vi.fn(),
  tableDelete: vi.fn(),
  chairFindFirst: vi.fn(),
  chairUpdateMany: vi.fn(),
  scheduleFindFirst: vi.fn(),
  scheduleDelete: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireOwner: mocks.requireOwner }))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: {
    eventTable: { findFirst: mocks.tableFindFirst, delete: mocks.tableDelete },
    chair: {
      findFirst: mocks.chairFindFirst,
      updateMany: mocks.chairUpdateMany,
    },
    scheduleItem: {
      findFirst: mocks.scheduleFindFirst,
      delete: mocks.scheduleDelete,
    },
  },
}))

import { DEMO_READ_ONLY_MESSAGE } from '@/lib/demo'
import { deleteScheduleItem } from './schedule'
import { deleteTable, resetTable, toggleChair } from './tables'

const DEMO_OWNER = {
  userId: 'u1',
  name: 'Demo',
  email: 'demo@event-roll.dev',
  organizationId: 'o1',
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requireOwner.mockResolvedValue(DEMO_OWNER)
})

describe('the demo organization is read-only for every destructive action', () => {
  it('refuses to delete a table', async () => {
    mocks.tableFindFirst.mockResolvedValue({ id: 't1', eventId: 'e1' })

    const result = await deleteTable('t1')

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.tableDelete).not.toHaveBeenCalled()
  })

  it('refuses to occupy or free a chair', async () => {
    mocks.chairFindFirst.mockResolvedValue({ id: 'c1', eventId: 'e1', occupied: false })

    const result = await toggleChair('c1')

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.chairUpdateMany).not.toHaveBeenCalled()
  })

  it('refuses to reset a table, which wipes seat assignments', async () => {
    mocks.tableFindFirst.mockResolvedValue({ id: 't1', eventId: 'e1' })

    const result = await resetTable('t1')

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.chairUpdateMany).not.toHaveBeenCalled()
  })

  it('refuses to delete a schedule item', async () => {
    mocks.scheduleFindFirst.mockResolvedValue({ id: 'i1', eventId: 'e1' })

    const result = await deleteScheduleItem('i1')

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.scheduleDelete).not.toHaveBeenCalled()
  })
})
