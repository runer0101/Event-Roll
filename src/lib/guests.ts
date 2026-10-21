import { normalizeText } from '@/lib/utils'

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
