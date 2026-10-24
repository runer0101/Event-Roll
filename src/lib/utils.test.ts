import { describe, expect, it } from 'vitest'
import {
  generateGuestCode,
  generateStaffCode,
  normalizeText,
  toDateTimeInput,
  zonedDateTimeToUtc,
} from './utils'

describe('codes', () => {
  it('generates readable, prefixed guest codes', () => {
    const code = generateGuestCode()
    expect(code).toMatch(/^INV-[A-Z2-9]{8}$/)
  })

  it('generates unique staff codes', () => {
    const codes = new Set(Array.from({ length: 50 }, generateStaffCode))
    expect(codes.size).toBe(50)
    expect([...codes].every((code) => /^STF-[A-Z2-9]{8}$/.test(code))).toBe(
      true,
    )
  })
})

describe('normalizeText', () => {
  it('removes accents, trims and collapses whitespace', () => {
    expect(normalizeText('  Nicolás   HERRERA ')).toBe('nicolas herrera')
  })
})

describe('zonedDateTimeToUtc', () => {
  it('uses the summer offset of the app timezone', () => {
    expect(
      zonedDateTimeToUtc('2026-07-01T20:00', 'Europe/Madrid').toISOString(),
    ).toBe('2026-07-01T18:00:00.000Z')
  })

  it('uses the winter offset of the app timezone', () => {
    expect(
      zonedDateTimeToUtc('2026-01-15T20:00', 'Europe/Madrid').toISOString(),
    ).toBe('2026-01-15T19:00:00.000Z')
  })

  it('round-trips through the datetime-local formatter', () => {
    const instant = zonedDateTimeToUtc('2026-07-01T20:00', 'Europe/Madrid')
    expect(toDateTimeInput(instant)).toBe('2026-07-01T20:00')
  })
})
