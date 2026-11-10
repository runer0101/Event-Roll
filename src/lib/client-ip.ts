/**
 * Best-effort client address for throttling.
 *
 * `x-forwarded-for` is only trustworthy behind a proxy that overwrites it;
 * Vercel does. When no header arrives every request shares the `unknown`
 * bucket, which fails closed: the throttle still applies, it just stops being
 * per-address.
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  if (first) return first

  const realIp = headers.get('x-real-ip')?.trim()
  return realIp || 'unknown'
}
