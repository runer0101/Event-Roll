import { z } from 'zod'

export const TableSchema = z.object({
  name: z.string().trim().min(1, 'Escribe el nombre de la mesa').max(40),
  capacity: z.coerce
    .number()
    .int()
    .min(1, 'La mesa necesita al menos una silla')
    .max(20, 'Máximo 20 sillas por mesa'),
})

export type TableInput = z.infer<typeof TableSchema>
