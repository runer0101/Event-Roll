import { describe, expect, it } from 'vitest'
import { MAX_PAGE, clampPage, normalizePage } from './pagination'

describe('normalizePage', () => {
  it('keeps a page the list can show', () => {
    expect(normalizePage('3')).toBe(3)
  })

  it('falls back to the first page when the parameter is missing', () => {
    expect(normalizePage(undefined)).toBe(1)
  })

  it('caps a huge page so the offset cannot overflow', () => {
    expect(normalizePage('999999999999999999999')).toBe(MAX_PAGE)
    expect(normalizePage(String(Number.MAX_SAFE_INTEGER))).toBe(MAX_PAGE)
    expect(normalizePage('999999')).toBe(MAX_PAGE)
  })

  it('stays inside the offset Prisma accepts for the guest page size', () => {
    // src/lib/queries/guests.ts pages guests 25 at a time.
    expect((MAX_PAGE - 1) * 25).toBeLessThanOrEqual(2 ** 31 - 1)
  })

  it('rejects values that are not a page number', () => {
    expect(normalizePage('abc')).toBe(1)
    expect(normalizePage('0')).toBe(1)
    expect(normalizePage('-4')).toBe(1)
    expect(normalizePage('1e9')).toBe(1)
    expect(normalizePage('')).toBe(1)
  })

  it('takes the first value when the parameter repeats', () => {
    expect(normalizePage(['2', '7'])).toBe(2)
    expect(normalizePage([])).toBe(1)
  })
})

describe('clampPage', () => {
  it('leaves a page inside the range alone', () => {
    expect(clampPage(2, 5)).toBe(2)
    expect(clampPage(1, 1)).toBe(1)
  })

  it('brings a page past the end back to the last page', () => {
    expect(clampPage(9, 3)).toBe(3)
  })

  it('never returns a page below the first', () => {
    expect(clampPage(0, 4)).toBe(1)
    expect(clampPage(-2, 4)).toBe(1)
  })

  it('never returns a page below the first when the range is empty', () => {
    expect(clampPage(5, 0)).toBe(1)
  })
})
