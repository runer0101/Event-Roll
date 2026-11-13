import { z } from 'zod'

/**
 * Ids are cuids minted by the database, and a Server Action receives whatever
 * the caller sent. One bounded shape keeps every id from reaching a query
 * unbounded; the message stays per-call because it is user-facing.
 */
export function idSchema(message = 'Id inválido') {
  return z.string().trim().min(1, message).max(64)
}
