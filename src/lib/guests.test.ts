import { describe, expect, it } from 'vitest'
import { guestDedupeKey } from './guests'

describe('guestDedupeKey', () => {
  it('uses a normalized email when present', () => {
    expect(
      guestDedupeKey({ name: 'Lucía Fernández', email: ' LUCIA@Example.com ' }),
    ).toBe('email:lucia@example.com')
  })

  it('falls back to name and phone digits', () => {
    expect(
      guestDedupeKey({
        name: 'Lucía Fernández',
        email: '',
        phone: '+34 600 100 000',
      }),
    ).toBe('phone:lucia fernandez:34600100000')
  })

  it('uses the name when there is no contact data', () => {
    expect(guestDedupeKey({ name: '  Ana   Vega ' })).toBe('name:ana vega')
  })

  it('is accent-insensitive for names', () => {
    expect(guestDedupeKey({ name: 'Nicolás Herrera' })).toBe(
      guestDedupeKey({ name: 'Nicolas Herrera' }),
    )
  })
})
