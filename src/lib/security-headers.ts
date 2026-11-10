/**
 * Content Security Policy for the whole app.
 *
 * Next's App Router ships inline bootstrap scripts, so `'unsafe-inline'` is
 * required for `script-src` unless every page is threaded with a per-request
 * nonce. This policy still blocks what matters most in a portfolio deployment:
 * third-party script sources, object embedding, `base-uri` hijacking and form
 * posts to foreign origins. `'unsafe-eval'` is added only for the dev server,
 * which needs it for hot reload.
 */
export function contentSecurityPolicy(isDev: boolean): string {
  const scripts = ["'self'", "'unsafe-inline'"]
  if (isDev) scripts.push("'unsafe-eval'")

  return [
    "default-src 'self'",
    `script-src ${scripts.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}
