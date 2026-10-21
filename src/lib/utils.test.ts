import { describe, expect, it } from 'vitest'
import {
  generateGuestCode,
  generateStaffCode,
  normalizeText,
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
