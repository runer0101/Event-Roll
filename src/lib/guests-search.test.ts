import { describe, expect, it } from 'vitest'
import { isSearchableQuery } from './guests'

describe('isSearchableQuery', () => {
  it('refuses a single letter, which would page through the whole list', () => {
    expect(isSearchableQuery('a')).toBe(false)
    expect(isSearchableQuery('  e  ')).toBe(false)
  })

  it('refuses an empty or blank query', () => {
    expect(isSearchableQuery('')).toBe(false)
    expect(isSearchableQuery('   ')).toBe(false)
  })

  it('accepts two characters, a name or an invitation code', () => {
    expect(isSearchableQuery('Lu')).toBe(true)
    expect(isSearchableQuery('INV-DEMO-0001')).toBe(true)
  })
})
