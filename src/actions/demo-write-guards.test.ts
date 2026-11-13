import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  auth: vi.fn(),
  getEventForOwner: vi.fn(),
  getActiveStaff: vi.fn(),
  eventCreate: vi.fn(),
  eventUpdate: vi.fn(),
  guestCreate: vi.fn(),
  guestUpdate: vi.fn(),
  guestCreateMany: vi.fn(),
  staffCreate: vi.fn(),
  staffUpdate: vi.fn(),
  scheduleCreate: vi.fn(),
  scheduleUpdate: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireOwner: mocks.requireOwner }))
vi.mock('@/auth', () => ({ auth: mocks.auth }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/queries/events', () => ({
  getEventForOwner: mocks.getEventForOwner,
}))
vi.mock('@/lib/queries/staff', () => ({
  getActiveStaff: mocks.getActiveStaff,
}))
vi.mock('@/lib/prisma', () => ({
  default: {
    event: { create: mocks.eventCreate, update: mocks.eventUpdate },
    guest: {
      create: mocks.guestCreate,
      update: mocks.guestUpdate,
      createMany: mocks.guestCreateMany,
    },
    staff: { create: mocks.staffCreate, update: mocks.staffUpdate },
    scheduleItem: {
      create: mocks.scheduleCreate,
      update: mocks.scheduleUpdate,
    },
  },
}))

import { DEMO_READ_ONLY_MESSAGE } from '@/lib/demo'
import { setEventStatus, updateEvent } from './events'
import { createGuest, updateGuest } from './guests'
import { createStaff, updateStaff } from './staff'
import { createScheduleItem, toggleScheduleItem } from './schedule'

const DEMO_OWNER = {
  userId: 'u1',
  name: 'Demo',
  email: 'demo@event-roll.dev',
  organizationId: 'o1',
}

const FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

const writers = () => [
  mocks.eventCreate,
  mocks.eventUpdate,
  mocks.guestCreate,
  mocks.guestUpdate,
  mocks.guestCreateMany,
  mocks.staffCreate,
  mocks.staffUpdate,
  mocks.scheduleCreate,
  mocks.scheduleUpdate,
]

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requireOwner.mockResolvedValue(DEMO_OWNER)
  mocks.auth.mockResolvedValue({ user: { ...DEMO_OWNER, role: 'OWNER' } })
  mocks.getEventForOwner.mockResolvedValue({ id: 'e1', status: 'ACTIVE' })
  mocks.getActiveStaff.mockResolvedValue({ id: 's1' })
})

describe('the demo organization refuses every write path with the published message', () => {
  it('refuses to change the event status, so the demo event cannot be closed', async () => {
    const result = await setEventStatus('e1', 'CLOSED')

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.eventUpdate).not.toHaveBeenCalled()
  })

  it('refuses to edit the demo event', async () => {
    const result = await updateEvent('e1', {
      name: 'Boda demo',
      date: FUTURE,
      location: 'Salón demo',
    })

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.eventUpdate).not.toHaveBeenCalled()
  })

  it('refuses to create a guest', async () => {
    const result = await createGuest('e1', { name: 'Ana Vega' })

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.guestCreate).not.toHaveBeenCalled()
  })

  it('refuses to edit a guest', async () => {
    const result = await updateGuest('g1', { name: 'Ana Vega' })

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.guestUpdate).not.toHaveBeenCalled()
  })

  it('refuses to create a staff member', async () => {
    const result = await createStaff('e1', { name: 'Luis Guardia' })

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.staffCreate).not.toHaveBeenCalled()
  })

  it('refuses to edit a staff member, so permissions stay as published', async () => {
    const result = await updateStaff('s1', {
      name: 'Luis Guardia',
      canViewContact: true,
    })

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.staffUpdate).not.toHaveBeenCalled()
  })

  it('refuses to add a schedule item', async () => {
    const result = await createScheduleItem('e1', {
      title: 'Montaje del salón',
      startAt: FUTURE,
    })

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.scheduleCreate).not.toHaveBeenCalled()
  })

  it('refuses to toggle a demo schedule item', async () => {
    const result = await toggleScheduleItem('i1')

    expect(result.error).toBe(DEMO_READ_ONLY_MESSAGE)
    expect(mocks.scheduleUpdate).not.toHaveBeenCalled()
  })

  it('never touches the database before refusing', async () => {
    await createGuest('e1', { name: 'Ana Vega' })

    expect(mocks.getEventForOwner).not.toHaveBeenCalled()
    for (const writer of writers()) expect(writer).not.toHaveBeenCalled()
  })
})

describe('any other organizer keeps writing', () => {
  const OWNER = {
    userId: 'u2',
    name: 'Cliente',
    email: 'cliente@ejemplo.com',
    organizationId: 'o2',
  }

  beforeEach(() => {
    mocks.requireOwner.mockResolvedValue(OWNER)
    mocks.auth.mockResolvedValue({ user: { ...OWNER, role: 'OWNER' } })
  })

  it('still changes the event status', async () => {
    const result = await setEventStatus('e1', 'CLOSED')

    expect(result.success).toBe(true)
    expect(mocks.eventUpdate).toHaveBeenCalledWith({
      where: { id: 'e1' },
      data: { status: 'CLOSED' },
    })
  })

  it('still creates a guest', async () => {
    mocks.guestCreate.mockResolvedValue({ id: 'g1' })

    const result = await createGuest('e1', { name: 'Ana Vega' })

    expect(result.success).toBe(true)
    expect(mocks.guestCreate).toHaveBeenCalled()
  })
})
