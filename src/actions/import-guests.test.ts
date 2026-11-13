import { beforeEach, describe, expect, it, vi } from 'vitest'

type StoredGuest = {
  organizationId: string
  eventId: string
  code: string
  name: string
  email: string | null
  phone: string | null
}

const store: StoredGuest[] = []

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  getEventForOwner: vi.fn(),
  transaction: vi.fn(),
  lock: vi.fn(),
  globalFindMany: vi.fn(),
  txFindMany: vi.fn(),
  txCreateMany: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireOwner: mocks.requireOwner }))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/queries/events', () => ({
  getEventForOwner: mocks.getEventForOwner,
}))
vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: mocks.transaction,
    guest: {
      findMany: mocks.globalFindMany,
      createMany: vi.fn(),
    },
  },
}))

import { DEMO_READ_ONLY_MESSAGE } from '@/lib/demo'
import { importGuests } from './guests'

const OWNER = {
  userId: 'u2',
  name: 'Cliente',
  email: 'cliente@ejemplo.com',
  organizationId: 'o2',
}

const ROWS = [
  { name: 'Ana Vega', email: 'ana@example.com' },
  { name: 'Beto Ruiz', email: 'beto@example.com' },
]

// Two overlapping imports model what Postgres does when both transactions take
// the same row lock: the callbacks run one after the other, in commit order.
let tail: Promise<unknown> = Promise.resolve()

function serializingTransaction() {
  mocks.transaction.mockImplementation(
    (callback: (tx: unknown) => Promise<unknown>) => {
      const run = tail.then(() =>
        callback({
          $queryRaw: mocks.lock,
          guest: { findMany: mocks.txFindMany, createMany: mocks.txCreateMany },
        }),
      )
      tail = run.then(
        () => undefined,
        () => undefined,
      )
      return run
    },
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  store.length = 0
  tail = Promise.resolve()
  mocks.requireOwner.mockResolvedValue(OWNER)
  mocks.getEventForOwner.mockResolvedValue({ id: 'e1' })
  mocks.lock.mockResolvedValue([{ id: 'e1' }])
  mocks.txFindMany.mockImplementation(
    (args: { where: { eventId: string } }) =>
      Promise.resolve(
        store
          .filter((guest) => guest.eventId === args.where.eventId)
          .map((guest) => ({
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
          })),
      ),
  )
  mocks.txCreateMany.mockImplementation(
    (args: { data: StoredGuest[] }) => {
      store.push(...args.data.map((row) => ({ ...row })))
      return Promise.resolve({ count: args.data.length })
    },
  )
  serializingTransaction()
})

describe('importGuests is idempotent under overlapping imports', () => {
  it('keeps a single set of guests when the same file is imported twice at once', async () => {
    const [first, second] = await Promise.all([
      importGuests('e1', { eventId: 'e1', rows: ROWS }),
      importGuests('e1', { eventId: 'e1', rows: ROWS }),
    ])

    expect(first.error).toBeUndefined()
    expect(second.error).toBeUndefined()
    expect(store.map((guest) => guest.email)).toEqual([
      'ana@example.com',
      'beto@example.com',
    ])
    expect((first.imported ?? 0) + (second.imported ?? 0)).toBe(2)
    expect((first.skipped ?? 0) + (second.skipped ?? 0)).toBe(2)
  })

  it('locks the event row before reading the guests already stored', async () => {
    await importGuests('e1', { eventId: 'e1', rows: ROWS })

    expect(mocks.lock).toHaveBeenCalled()
    expect(mocks.lock.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.txFindMany.mock.invocationCallOrder[0]!,
    )
    expect(mocks.globalFindMany).not.toHaveBeenCalled()
  })

  it('still skips guests that a previous import already stored', async () => {
    store.push({
      organizationId: 'o2',
      eventId: 'e1',
      code: 'INV-OLD',
      name: 'Ana Vega',
      email: 'ana@example.com',
      phone: null,
    })

    const result = await importGuests('e1', { eventId: 'e1', rows: ROWS })

    expect(result).toMatchObject({ success: true, imported: 1, skipped: 1 })
    expect(store).toHaveLength(2)
  })

  it('refuses the import for the demo organization', async () => {
    mocks.requireOwner.mockResolvedValue({
      userId: 'u1',
      name: 'Demo',
      email: 'demo@event-roll.dev',
      organizationId: 'o1',
    })

    const result = await importGuests('e1', { eventId: 'e1', rows: ROWS })

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.transaction).not.toHaveBeenCalled()
    expect(store).toHaveLength(0)
  })
})
