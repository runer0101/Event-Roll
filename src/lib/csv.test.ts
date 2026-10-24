import { describe, expect, it } from 'vitest'
import { csvCell } from './csv'

describe('csvCell', () => {
  it('quotes plain values', () => {
    expect(csvCell('Lucía')).toBe(`"Lucía"`)
  })

  it('escapes embedded quotes', () => {
    expect(csvCell('a"b')).toBe(`"a""b"`)
  })

  it('neutralizes formula prefixes', () => {
    expect(csvCell('=1+1')).toBe(`"'=1+1"`)
    expect(csvCell('+34 600 100 000')).toBe(`"'+34 600 100 000"`)
    expect(csvCell('-5')).toBe(`"'-5"`)
    expect(csvCell('@cmd')).toBe(`"'@cmd"`)
    expect(csvCell('\t=cmd')).toBe(`"'\t=cmd"`)
    expect(csvCell('\r=cmd')).toBe(`"'\r=cmd"`)
  })

  it('renders nullish values as an empty cell', () => {
    expect(csvCell(null)).toBe(`""`)
    expect(csvCell(undefined)).toBe(`""`)
  })
})
