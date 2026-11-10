import { describe, expect, it } from 'vitest'
import { clientIpFrom } from './client-ip'

describe('clientIpFrom', () => {
  it('takes the first address of x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.7, 10.0.0.1, 10.0.0.2',
    })

    expect(clientIpFrom(headers)).toBe('203.0.113.7')
  })

  it('falls back to x-real-ip', () => {
    const headers = new Headers({ 'x-real-ip': '198.51.100.4' })

    expect(clientIpFrom(headers)).toBe('198.51.100.4')
  })

  it('returns one stable bucket when the deployment sends no address', () => {
    expect(clientIpFrom(new Headers())).toBe('unknown')
  })
})
