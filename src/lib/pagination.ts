const FIRST_PAGE = 1

/**
 * `skip` reaches Postgres as an Int, so a crafted `?page=` above this ceiling
 * would overflow the offset instead of returning an empty list. At 25 guests
 * per page this bound is five orders of magnitude beyond any real event.
 */
export const MAX_PAGE = 100_000

function clampPageNumber(page: number): number {
  if (!Number.isFinite(page)) return FIRST_PAGE
  const whole = Math.trunc(page)
  if (whole < FIRST_PAGE) return FIRST_PAGE
  return Math.min(whole, MAX_PAGE)
}

/**
 * Turns a raw search parameter into a page number the guest query can safely
 * use. Anything that is not a positive integer becomes the first page.
 */
export function normalizePage(raw: unknown): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value === 'number') return clampPageNumber(value)
  if (typeof value !== 'string') return FIRST_PAGE

  const trimmed = value.trim()
  // `parseInt` alone accepts `1e9` as 1 and `12abc` as 12, so only a plain
  // run of digits is a page number.
  if (!/^\d+$/.test(trimmed)) return FIRST_PAGE

  return clampPageNumber(Number.parseInt(trimmed, 10))
}

/**
 * Brings a page back inside the range the current list actually has, so a
 * stale link shows the last page instead of an empty one.
 */
export function clampPage(page: number, pageCount: number): number {
  const safeCount = Number.isFinite(pageCount)
    ? Math.max(FIRST_PAGE, Math.trunc(pageCount))
    : FIRST_PAGE
  return Math.min(clampPageNumber(page), safeCount)
}
