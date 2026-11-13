'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { DEMO_READ_ONLY_MESSAGE, isDemoOwner } from '@/lib/demo'
import { requireOwner, resolveStaff } from '@/lib/session'
import { getEventForOwner } from '@/lib/queries/events'
import { guestDedupeKey } from '@/lib/guests'
import { generateGuestCode, normalizeText } from '@/lib/utils'
import {
  GuestIdSchema,
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
  // The demo organization is shared with every visitor: writing to it with the
  // published credentials would change what the next visitor sees.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = GuestSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const data = parsed.data
  const guest = await prisma.guest.create({
    data: {
      organizationId: owner.organizationId,
      eventId: event.id,
      code: generateGuestCode(),
      name: data.name,
      searchName: normalizeText(data.name),
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
  // Not only the owner: the seed also publishes a coordinating staff code,
  // so a demo staff session must be refused just the same.
  if (isDemoOwner({ email: user.email ?? '' })) {
    return { error: DEMO_READ_ONLY_MESSAGE }
  }

  const parsed = GuestSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const data = parsed.data
  const canEditContact = user.role === 'OWNER'

  // Check the permission before looking the guest up so an unprivileged staff
  // member cannot use the response to probe guest IDs.
  if (user.role === 'STAFF') {
    const access = await resolveStaff(user)
    if (!access.ok) return { error: access.error }
    if (!access.staff.canEditGuests) {
      return { error: 'No tienes permiso para editar invitados' }
    }
  }

  const guest = await prisma.guest.findFirst({
    where: {
      id: guestId,
      organizationId: user.organizationId,
      ...(user.role === 'STAFF' ? { eventId: user.eventId } : {}),
    },
  })
  if (!guest) return { error: 'Invitado no encontrado' }

  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      name: data.name,
      searchName: normalizeText(data.name),
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
  // The demo organization is shared: deleting guests would empty the demo.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const parsedId = GuestIdSchema.safeParse(guestId)
  if (!parsedId.success) return { error: 'Invitado inválido' }

  const guest = await prisma.guest.findFirst({
    where: { id: parsedId.data, organizationId: owner.organizationId },
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
  // The demo organization is shared with every visitor: an import would rewrite
  // the published list for everyone.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = ImportGuestsSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  // Reading the stored guests and inserting the new ones inside the same
  // transaction keeps two overlapping imports of the same file from both
  // passing the duplicate check: the row lock serializes them per event.
  const result = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Event" WHERE "id" = ${event.id} FOR UPDATE`

      const existing = await tx.guest.findMany({
        where: { eventId: event.id, organizationId: owner.organizationId },
        select: { name: true, email: true, phone: true },
      })
      const keys = new Set(existing.map(guestDedupeKey))
      const rows: Array<{
        organizationId: string
        eventId: string
        code: string
        name: string
        searchName: string
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
          searchName: normalizeText(row.name),
          email: optional(row.email),
          phone: optional(row.phone),
          category: optional(row.category),
          plusOnes: row.plusOnes,
          table: optional(row.table),
          notes: optional(row.notes),
        })
      }

      if (rows.length > 0) {
        await tx.guest.createMany({ data: rows })
      }

      return { imported: rows.length, skipped }
    },
    // A second import waits on the row lock instead of failing on timeout.
    { timeout: 15_000 },
  )

  revalidatePath(`/dashboard/events/${event.id}`, 'layout')
  return { success: true, imported: result.imported, skipped: result.skipped }
}
