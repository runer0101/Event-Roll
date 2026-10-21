import { z } from 'zod'

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email inválido')
  .optional()
  .or(z.literal(''))

export const GuestSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(120),
  email: optionalEmail,
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  category: z.string().trim().max(40).optional().or(z.literal('')),
  plusOnes: z.coerce.number().int().min(0).max(20).default(0),
  table: z.string().trim().max(40).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
})

export const GuestIdSchema = z.object({ guestId: z.string().min(1) })

export const ImportGuestsSchema = z.object({
  eventId: z.string().min(1),
  rows: z.array(GuestSchema).min(1, 'No hay invitados para importar').max(5000),
})

export type GuestInput = z.infer<typeof GuestSchema>
