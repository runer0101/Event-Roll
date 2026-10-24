import { z } from 'zod'

export const EventSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre del evento').max(120),
  date: z.coerce.date({ error: 'Fecha inválida' }),
  location: z.string().trim().min(2, 'Escribe el lugar').max(160),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
})

export const EventStatusSchema = z.enum(['ACTIVE', 'CLOSED'])

export type EventInput = z.infer<typeof EventSchema>
