'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { getActiveStaff } from '@/lib/queries/staff'
import { searchGuestsForStaff } from '@/lib/queries/guests'

type ActionResult = {
  success?: boolean
  error?: string
  alreadyCheckedIn?: boolean
}

export type StaffGuestResult = {
  id: string
  code: string
  name: string
  category: string | null
  plusOnes: number
  status: string
  checkedInAt: string | null
  email?: string
  phone?: string
  table?: string | null
  notes?: string | null
  checkedInByName?: string | null
}

export async function searchGuests(query: string): Promise<StaffGuestResult[]> {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'STAFF' || !user.staffId || !user.eventId) {
    return []
  }

  const staff = await getActiveStaff(
    user.staffId,
    user.eventId,
    user.organizationId,
    user.staffSessionVersion ?? -1,
  )
  if (!staff) return []

  const guests = await searchGuestsForStaff(
    staff.eventId,
    staff.organizationId,
    query,
    staff.canViewContact,
    staff.canEditGuests,
  )

  return guests.map((guest) => ({
    id: guest.id,
    code: guest.code,
    name: guest.name,
    category: guest.category,
    plusOnes: guest.plusOnes,
    status: guest.status,
    checkedInAt: guest.checkedInAt?.toISOString() ?? null,
    email: guest.email ?? undefined,
    phone: guest.phone ?? undefined,
    table: guest.table ?? null,
    notes: guest.notes ?? null,
    checkedInByName: guest.checkedInBy?.name ?? null,
  }))
}

export async function checkInGuest(guestId: string): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'STAFF' || !user.staffId || !user.eventId) {
    return { error: 'No autorizado' }
  }

  const staff = await getActiveStaff(
    user.staffId,
    user.eventId,
    user.organizationId,
    user.staffSessionVersion ?? -1,
  )
  if (!staff) return { error: 'Tu acceso está inactivo' }
  if (staff.event.status !== 'ACTIVE') {
    return { error: 'El evento está cerrado' }
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.guest.updateManyAndReturn({
      where: {
        id: guestId,
        eventId: staff.eventId,
        organizationId: staff.organizationId,
        status: 'INVITED',
      },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
        checkedInById: staff.id,
      },
      select: { name: true },
    })

    if (updated.length !== 1) {
      return { ok: false as const }
    }

    await tx.accessLog.create({
      data: {
        organizationId: staff.organizationId,
        eventId: staff.eventId,
        guestId,
        guestName: updated[0]!.name,
        staffId: staff.id,
        action: 'CHECK_IN',
      },
    })

    return { ok: true as const }
  })

  if (!result.ok) {
    return {
      error: 'Esta entrada ya fue utilizada o el invitado no existe',
      alreadyCheckedIn: true,
    }
  }

  revalidatePath(`/staff/event/${staff.eventId}`, 'layout')
  revalidatePath(`/dashboard/events/${staff.eventId}`, 'layout')
  return { success: true }
}

export async function undoCheckIn(guestId: string): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { error: 'No autorizado' }

  const guest = await prisma.guest.findFirst({
    where: {
      id: guestId,
      organizationId: user.organizationId,
      ...(user.role === 'STAFF' ? { eventId: user.eventId } : {}),
    },
  })
  if (!guest) return { error: 'Invitado no encontrado' }
  if (guest.status !== 'CHECKED_IN') {
    return { error: 'Ese invitado no tiene una entrada activa' }
  }

  let staffId: string | null = null
  if (user.role === 'STAFF') {
    if (!user.staffId || !user.eventId) return { error: 'No autorizado' }
    const staff = await getActiveStaff(
      user.staffId,
      user.eventId,
      user.organizationId,
      user.staffSessionVersion ?? -1,
    )
    if (!staff?.canUndoCheckIn) {
      return { error: 'No tienes permiso para deshacer check-ins' }
    }
    staffId = staff.id
  }

  const undone = await prisma.$transaction(async (tx) => {
    // Conditional update, mirroring the check-in path: two guards undoing the
    // same entry (or an undo racing a check-in) only logs once.
    const updated = await tx.guest.updateMany({
      where: {
        id: guest.id,
        eventId: guest.eventId,
        organizationId: guest.organizationId,
        status: 'CHECKED_IN',
      },
      data: { status: 'INVITED', checkedInAt: null, checkedInById: null },
    })

    if (updated.count !== 1) {
      return false
    }

    await tx.accessLog.create({
      data: {
        organizationId: guest.organizationId,
        eventId: guest.eventId,
        guestId: guest.id,
        guestName: guest.name,
        staffId,
        action: 'UNDO_CHECK_IN',
      },
    })

    return true
  })

  if (!undone) {
    return { error: 'Ese invitado ya no tiene una entrada activa' }
  }

  revalidatePath(`/staff/event/${guest.eventId}`, 'layout')
  revalidatePath(`/dashboard/events/${guest.eventId}`, 'layout')
  return { success: true }
}
