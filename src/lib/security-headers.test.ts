import { describe, expect, it } from 'vitest'
import { contentSecurityPolicy } from './security-headers'

function directive(policy: string, name: string): string | undefined {
  return policy
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `))
}

describe('contentSecurityPolicy', () => {
  it('blocks framing, plugins and base-uri hijacking', () => {
    const policy = contentSecurityPolicy(false)

    expect(directive(policy, 'frame-ancestors')).toBe("frame-ancestors 'none'")
    expect(directive(policy, 'object-src')).toBe("object-src 'none'")
    expect(directive(policy, 'base-uri')).toBe("base-uri 'self'")
    expect(directive(policy, 'form-action')).toBe("form-action 'self'")
  })

  it('refuses third-party script sources', () => {
    const policy = contentSecurityPolicy(false)
    const script = directive(policy, 'script-src')

    expect(script).toBe("script-src 'self' 'unsafe-inline'")
    expect(script).not.toContain('*')
    expect(script).not.toContain('unsafe-eval')
  })

  it('allows eval only on the dev server, which needs it for hot reload', () => {
    expect(directive(contentSecurityPolicy(true), 'script-src')).toContain(
      "'unsafe-eval'",
    )
    expect(directive(contentSecurityPolicy(false), 'script-src')).not.toContain(
      "'unsafe-eval'",
    )
  })
})
