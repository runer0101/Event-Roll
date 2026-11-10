import { normalizeText } from '@/lib/utils'

/**
 * A guard's search runs on the server with `contains`, so a single letter would
 * page through the whole guest list — exactly the exposure the product claims to
 * prevent. Two characters still match a name or an invitation code.
 */
export const MIN_SEARCH_LENGTH = 2

export function isSearchableQuery(query: string): boolean {
  return query.trim().length >= MIN_SEARCH_LENGTH
}

/** Stable key used to avoid importing the same guest twice. */
export function guestDedupeKey(guest: {
  name: string
  email?: string | null
  phone?: string | null
}): string {
  const email = guest.email?.trim().toLowerCase()
  if (email) return `email:${email}`

  const phone = guest.phone?.replace(/\D/g, '')
  if (phone) return `phone:${normalizeText(guest.name)}:${phone}`

  return `name:${normalizeText(guest.name)}`
}
