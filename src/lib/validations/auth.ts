import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(80),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña es demasiado larga'),
  organizationName: z
    .string()
    .trim()
    .min(2, 'Escribe el nombre de tu organización')
    .max(80),
})

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(1, 'Escribe tu contraseña').max(72),
})

export const StaffCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, 'Escribe el código')
    .max(40)
    .transform((value) => value.toUpperCase()),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
