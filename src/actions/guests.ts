'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { requireOwner } from '@/lib/session'
import { getEventForOwner } from '@/lib/queries/events'
import { getActiveStaff } from '@/lib/queries/staff'
import { guestDedupeKey } from '@/lib/guests'
import { generateGuestCode } from '@/lib/utils'
import {
  GuestSchema,
  ImportGuestsSchema,
} from '@/lib/validations/guests'

type ActionResult = {
  success?: boolean
  error?: string
  guestId?: string
  imported?: number
  skipped?: number
}

function optional(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createGuest(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = GuestSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  const data = parsed.data
  const guest = await prisma.guest.create({
    data: {
      organizationId: owner.organizationId,
      eventId: event.id,
      code: generateGuestCode(),
      name: data.name,
      email: optional(data.email),
      phone: optional(data.phone),
      category: optional(data.category),
      plusOnes: data.plusOnes,
      table: optional(data.table),
      notes: optional(data.notes),
    },
  })

  revalidatePath(`/dashboard/events/${event.id}`, 'layout')
  return { success: true, guestId: guest.id }
}

export async function updateGuest(
  guestId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { error: 'No autorizado' }

  const parsed = GuestSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  const guest = await prisma.guest.findFirst({
    where: {
      id: guestId,
      organizationId: user.organizationId,
      ...(user.role === 'STAFF' ? { eventId: user.eventId } : {}),
    },
  })
  if (!guest) return { error: 'Invitado no encontrado' }

  const data = parsed.data
  const canEditContact = user.role === 'OWNER'

  if (user.role === 'STAFF') {
    if (!user.staffId || !user.eventId) return { error: 'No autorizado' }
    const staff = await getActiveStaff(
      user.staffId,
      user.eventId,
      user.organizationId,
    )
    if (!staff?.canEditGuests) {
      return { error: 'No tienes permiso para editar invitados' }
    }
  }

  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      name: data.name,
      category: optional(data.category),
      plusOnes: data.plusOnes,
      table: optional(data.table),
      notes: optional(data.notes),
      ...(canEditContact
        ? { email: optional(data.email), phone: optional(data.phone) }
        : {}),
    },
  })

  revalidatePath(`/dashboard/events/${guest.eventId}`, 'layout')
  revalidatePath(`/staff/event/${guest.eventId}`, 'layout')
  return { success: true, guestId: guest.id }
}

export async function deleteGuest(guestId: string): Promise<ActionResult> {
  const owner = await requireOwner()
  const guest = await prisma.guest.findFirst({
    where: { id: guestId, organizationId: owner.organizationId },
  })
  if (!guest) return { error: 'Invitado no encontrado' }

  await prisma.guest.delete({ where: { id: guest.id } })
  revalidatePath(`/dashboard/events/${guest.eventId}`, 'layout')
  return { success: true }
}

export async function importGuests(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = ImportGuestsSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  const existing = await prisma.guest.findMany({
    where: { eventId: event.id, organizationId: owner.organizationId },
    select: { name: true, email: true, phone: true },
  })
  const keys = new Set(existing.map(guestDedupeKey))
  const rows: Array<{
    organizationId: string
    eventId: string
    code: string
    name: string
    email: string | null
    phone: string | null
    category: string | null
    plusOnes: number
    table: string | null
    notes: string | null
  }> = []
  let skipped = 0

  for (const row of parsed.data.rows) {
    const key = guestDedupeKey(row)
    if (keys.has(key)) {
      skipped += 1
      continue
    }
    keys.add(key)
    rows.push({
      organizationId: owner.organizationId,
      eventId: event.id,
      code: generateGuestCode(),
      name: row.name,
      email: optional(row.email),
      phone: optional(row.phone),
      category: optional(row.category),
      plusOnes: row.plusOnes,
      table: optional(row.table),
      notes: optional(row.notes),
    })
  }

  if (rows.length > 0) {
    await prisma.guest.createMany({ data: rows })
  }

  revalidatePath(`/dashboard/events/${event.id}`, 'layout')
  return { success: true, imported: rows.length, skipped }
}
