import { customAlphabet } from 'nanoid'

/** Joins conditional class names without pulling in another dependency. */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ')
}

/**
 * The app renders every timestamp in its configured timezone, on the server
 * and in the browser. Without this, Vercel (UTC) and a Spanish phone (CEST)
 * showed different hours for the same check-in.
 */
export const APP_TIME_ZONE =
  process.env.NEXT_PUBLIC_APP_TIMEZONE ?? 'Europe/Madrid'

const dateFormatter = new Intl.DateTimeFormat('es', {
  dateStyle: 'long',
  timeZone: APP_TIME_ZONE,
})

const dateTimeFormatter = new Intl.DateTimeFormat('es', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: APP_TIME_ZONE,
})

const timeFormatter = new Intl.DateTimeFormat('es', {
  timeStyle: 'short',
  timeZone: APP_TIME_ZONE,
})

export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(new Date(date))
}

export function formatTime(date: Date | string): string {
  return timeFormatter.format(new Date(date))
}

/** Value for an <input type="datetime-local"> in the app's timezone. */
export function toDateTimeInput(date: Date | string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(date))

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'

  return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value(
    'minute',
  )}`
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  const asUtc = Date.UTC(
    value('year'),
    value('month') - 1,
    value('day'),
    value('hour'),
    value('minute'),
    value('second'),
  )

  return asUtc - date.getTime()
}

/**
 * Turns the wall time of a datetime-local input into the instant it represents
 * in the app's timezone. Without this the browser interprets the same string
 * in the user's own timezone, so an organizer abroad would save a different
 * hour than the one the app displays.
 *
 * shortcut: an ambiguous wall time around a DST fall-back resolves to one of
 * the two offsets; add a timezone library if events ever need strict DST rules.
 */
export function zonedDateTimeToUtc(
  value: string,
  timeZone: string = APP_TIME_ZONE,
): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (!match) return new Date(value)

  const [, year, month, day, hour, minute] = match
  const wallClockUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  )

  // Resolve the offset twice: the first pass uses the guessed instant, the
  // second one the corrected instant, which covers DST changes around it.
  let instant = wallClockUtc - timeZoneOffsetMs(new Date(wallClockUtc), timeZone)
  instant = wallClockUtc - timeZoneOffsetMs(new Date(instant), timeZone)
  return new Date(instant)
}

/** Lowercase, accent-free text used for search and duplicate detection. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

const codeAlphabet = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8)

/** Guest identifier printed on the invitation and used for quick search. */
export function generateGuestCode(): string {
  return `INV-${codeAlphabet()}`
}

/** Staff access code. It is the only credential a guard needs. */
export function generateStaffCode(): string {
  return `STF-${codeAlphabet()}`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

export function absoluteUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}${path}`
}
