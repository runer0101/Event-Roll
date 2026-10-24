'use server'

import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { signIn, signOut } from '@/auth'
import prisma from '@/lib/prisma'
import {
  clearFailures,
  recordFailure,
  retryAfterSeconds,
  tooManyAttemptsMessage,
} from '@/lib/rate-limit'
import { LoginSchema, RegisterSchema, StaffCodeSchema } from '@/lib/validations/auth'

type ActionResult = { success?: boolean; error?: string }

const LOGIN_WINDOW_MS = 10 * 60 * 1000
const OWNER_ATTEMPT_LIMIT = 5
const STAFF_ATTEMPT_LIMIT = 8

export async function registerOrganizer(input: unknown): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
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

  const key = `owner:${parsed.data.email}`
  const wait = retryAfterSeconds(key, OWNER_ATTEMPT_LIMIT)
  if (wait > 0) return { error: tooManyAttemptsMessage(wait) }

  try {
    // `redirect: false` keeps the success path reachable: the default redirect
    // throws before the failure counter can be cleared.
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      recordFailure(key, LOGIN_WINDOW_MS)
      return { error: 'Email o contraseña incorrectos' }
    }
    throw error
  }

  clearFailures(key)
  redirect('/dashboard')
}

export async function loginStaff(input: unknown): Promise<ActionResult> {
  const parsed = StaffCodeSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Escribe un código válido' }
  }

  const key = `staff:${parsed.data.code}`
  const wait = retryAfterSeconds(key, STAFF_ATTEMPT_LIMIT)
  if (wait > 0) return { error: tooManyAttemptsMessage(wait) }

  const staff = await prisma.staff.findUnique({
    where: { code: parsed.data.code },
    include: { event: true },
  })

  if (!staff || !staff.active) {
    recordFailure(key, LOGIN_WINDOW_MS)
    return { error: 'Código inválido o inactivo' }
  }
  if (staff.event.status !== 'ACTIVE') {
    clearFailures(key)
    return { error: 'Este evento ya está cerrado' }
  }

  clearFailures(key)
  try {
    await signIn('staff-code', {
      code: parsed.data.code,
      redirectTo: `/staff/event/${staff.eventId}`,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      recordFailure(key, LOGIN_WINDOW_MS)
      return { error: 'No se pudo iniciar sesión con ese código' }
    }
    throw error
  }

  return { success: true }
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: '/' })
}
