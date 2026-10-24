/**
 * Small in-process failure counter for login attempts.
 *
 * It is a speed bump, not a distributed limiter: each server instance keeps
 * its own map and a cold start resets it. For a single-region deployment that
 * already pairs with bcrypt and 8-character codes this covers the realistic
 * brute-force attempt; move it to Redis if the app ever needs a hard guarantee.
 */
type FailureBucket = {
  failures: number
  resetAt: number
}

const buckets = new Map<string, FailureBucket>()
const MAX_KEYS = 5_000

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }

  // Map preserves insertion order, so the oldest keys go first.
  while (buckets.size >= MAX_KEYS) {
    const oldest = buckets.keys().next().value
    if (!oldest) break
    buckets.delete(oldest)
  }
}

export function retryAfterSeconds(key: string, limit: number): number {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket) return 0
  if (bucket.resetAt <= now) {
    buckets.delete(key)
    return 0
  }
  if (bucket.failures < limit) return 0
  return Math.ceil((bucket.resetAt - now) / 1000)
}

export function recordFailure(key: string, windowMs: number): void {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { failures: 1, resetAt: now + windowMs })
  } else {
    bucket.failures += 1
  }
  if (buckets.size >= MAX_KEYS) prune(now)
}

export function clearFailures(key: string): void {
  buckets.delete(key)
}

export function tooManyAttemptsMessage(seconds: number): string {
  const minutes = Math.max(1, Math.ceil(seconds / 60))
  return `Demasiados intentos. Vuelve a probar en ${minutes} minuto${
    minutes === 1 ? '' : 's'
  }.`
}
