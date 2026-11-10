import { afterEach, describe, expect, it } from 'vitest'
import { DEMO_READ_ONLY_MESSAGE, isDemoOwner } from './demo'

const ORIGINAL = process.env.DEMO_OWNER_EMAIL

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.DEMO_OWNER_EMAIL
  else process.env.DEMO_OWNER_EMAIL = ORIGINAL
})

describe('isDemoOwner', () => {
  it('recognises the published demo organizer', () => {
    expect(isDemoOwner({ email: 'demo@event-roll.dev' })).toBe(true)
  })

  it('ignores case and surrounding spaces', () => {
    expect(isDemoOwner({ email: '  Demo@Event-Roll.dev ' })).toBe(true)
  })

  it('lets any other organizer through', () => {
    expect(isDemoOwner({ email: 'cliente@ejemplo.com' })).toBe(false)
  })

  it('follows DEMO_OWNER_EMAIL when a deployment renames the demo', () => {
    process.env.DEMO_OWNER_EMAIL = 'demo@otro-dominio.dev'

    expect(isDemoOwner({ email: 'demo@otro-dominio.dev' })).toBe(true)
    expect(isDemoOwner({ email: 'demo@event-roll.dev' })).toBe(false)
  })
})

describe('DEMO_READ_ONLY_MESSAGE', () => {
  it('says it is read-only and offers the way out', () => {
    expect(DEMO_READ_ONLY_MESSAGE).toContain('sólo lectura')
  })
})
