import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  eventFindMany: vi.fn(),
  guestGroupBy: vi.fn(),
  guestCount: vi.fn(),
  accessLogFindMany: vi.fn(),
  staffFindMany: vi.fn(),
  staffCount: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireOwner: mocks.requireOwner }))
vi.mock('@/lib/prisma', () => ({
  default: {
    event: { findMany: mocks.eventFindMany },
    guest: { groupBy: mocks.guestGroupBy, count: mocks.guestCount },
    accessLog: { findMany: mocks.accessLogFindMany },
    staff: { findMany: mocks.staffFindMany, count: mocks.staffCount },
  },
}))
// The page's chrome is not what this test measures: it renders the progress
// numbers, so links and icons are replaced by inert stubs.
vi.mock('next/link', () => ({ default: () => null }))
vi.mock('lucide-react', () => ({
  CalendarDays: () => null,
  CheckCircle2: () => null,
  DoorOpen: () => null,
  Plus: () => null,
  Users: () => null,
}))

import { renderToStaticMarkup } from 'react-dom/server'
import {
  getEventCounters,
  getEventsForOwner,
  progressRate,
} from '@/lib/queries/events'
import { getLiveData } from '@/lib/queries/live'
import DashboardPage from './page'

const EVENT = {
  id: 'e1',
  organizationId: 'o1',
  name: 'Boda',
  date: new Date('2030-01-01T20:00:00Z'),
  location: 'Salón',
  status: 'ACTIVE',
  _count: { guests: 4, staff: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requireOwner.mockResolvedValue({
    userId: 'u1',
    name: 'Demo',
    email: 'cliente@ejemplo.com',
    organizationId: 'o1',
  })
  mocks.eventFindMany.mockResolvedValue([EVENT])
  mocks.guestGroupBy.mockResolvedValue([
    { eventId: 'e1', status: 'CHECKED_IN', _count: { _all: 1 } },
    { eventId: 'e1', status: 'INVITED', _count: { _all: 2 } },
    { eventId: 'e1', status: 'CANCELLED', _count: { _all: 1 } },
  ])
  mocks.guestCount.mockImplementation(
    (args: { where: { status?: unknown } }) => {
      const status = args.where.status
      if (status === 'CHECKED_IN') return Promise.resolve(1)
      return Promise.resolve(3)
    },
  )
  mocks.accessLogFindMany.mockResolvedValue([])
  mocks.staffFindMany.mockResolvedValue([
    {
      id: 's1',
      name: 'Guardia',
      _count: { checkIns: 1 },
      checkIns: [{ checkedInAt: new Date('2030-01-01T20:30:00Z') }],
    },
  ])
  mocks.staffCount.mockResolvedValue(1)
})

async function renderDashboard() {
  return renderToStaticMarkup(
    (await DashboardPage()) as unknown as Parameters<typeof renderToStaticMarkup>[0],
  )
}

describe('dashboard progress counts the same guests as the live view', () => {
  it('excludes cancelled guests from the denominator', async () => {
    const html = await renderDashboard()

    expect(html).toContain('1 de 3 dentro')
    expect(html).toContain('33%')
    expect(html).not.toContain('25%')
    expect(html).not.toContain('de 4 dentro')
  })

  it('agrees with the live panel and the staff counters', async () => {
    const [event] = await getEventsForOwner('o1')
    const live = await getLiveData('e1', 'o1')
    const counters = await getEventCounters('e1', 'o1')

    expect(event?.countedGuests).toBe(3)
    expect(live.stats.total).toBe(3)
    expect(counters.total).toBe(3)
    expect(progressRate(event!.checkedIn, event!.countedGuests)).toBe(
      live.stats.rate,
    )
    expect(progressRate(counters.checkedIn, counters.total)).toBe(
      live.stats.rate,
    )
    expect(live.stats.rate).toBe(33)
  })

  it('shows 0% when every guest is cancelled', async () => {
    mocks.eventFindMany.mockResolvedValue([
      { ...EVENT, _count: { guests: 2, staff: 1 } },
    ])
    mocks.guestGroupBy.mockResolvedValue([
      { eventId: 'e1', status: 'CANCELLED', _count: { _all: 2 } },
    ])

    const html = await renderDashboard()

    expect(html).toContain('0 de 0 dentro')
    expect(html).toContain('>0%<')
  })
})
