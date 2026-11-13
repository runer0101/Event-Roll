import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ revalidatePath: vi.fn() }))

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

import { revalidateEvent } from './revalidate'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('revalidateEvent', () => {
  it('invalidates the organizer and staff screens of that event', () => {
    revalidateEvent('e1')

    expect(mocks.revalidatePath.mock.calls).toEqual([
      ['/dashboard/events/e1', 'layout'],
      ['/staff/event/e1', 'layout'],
    ])
  })
})
