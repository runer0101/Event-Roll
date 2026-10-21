'use server'

import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { signIn, signOut } from '@/auth'
import prisma from '@/lib/prisma'
import { LoginSchema, RegisterSchema, StaffCodeSchema } from '@/lib/validations/auth'

type ActionResult = { success?: boolean; error?: string }

export async function registerOrganizer(input: unknown): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  const { name, email, password, organizationName } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'Ya existe una cuenta con ese email' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash },
    })
    await tx.organization.create({
      data: { name: organizationName, ownerId: user.id },
    })
  })

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Cuenta creada. Inicia sesión con tus credenciales.' }
    }
    throw error
  }

  return { success: true }
}

export async function loginOrganizer(input: unknown): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Email o contraseña inválidos' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos' }
    }
    throw error
  }

  return { success: true }
}

export async function loginStaff(input: unknown): Promise<ActionResult> {
  const parsed = StaffCodeSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Escribe un código válido' }
  }

  const staff = await prisma.staff.findUnique({
    where: { code: parsed.data.code },
    include: { event: true },
  })

  if (!staff || !staff.active) {
    return { error: 'Código inválido o inactivo' }
  }
  if (staff.event.status !== 'ACTIVE') {
    return { error: 'Este evento ya está cerrado' }
  }

  try {
    await signIn('staff-code', {
      code: parsed.data.code,
      redirectTo: `/staff/event/${staff.eventId}`,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'No se pudo iniciar sesión con ese código' }
    }
    throw error
  }

  return { success: true }
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: '/' })
}
