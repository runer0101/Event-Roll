import { z } from 'zod'

export const EVENT_DATE_MESSAGE = 'La fecha del evento debe ser futura'

/**
 * Creating and editing share one rule: an event date is never in the past.
 * It lives in the schema, not in the action, so a future action cannot skip it
 * and the two paths cannot drift apart again.
 */
export const EventSchema = z
  .object({
    name: z.string().trim().min(2, 'Escribe el nombre del evento').max(120),
    date: z.coerce.date({ error: 'Fecha inválida' }),
    location: z.string().trim().min(2, 'Escribe el lugar').max(160),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
  })
  .refine((value) => value.date.getTime() >= Date.now(), {
    message: EVENT_DATE_MESSAGE,
    path: ['date'],
  })

export const EventStatusSchema = z.enum(['ACTIVE', 'CLOSED'])
