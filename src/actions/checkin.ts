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
  )
  if (!staff) return []

  const guests = await searchGuestsForStaff(
    staff.eventId,
    staff.organizationId,
    query,
    staff.canViewContact,
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
  )
  if (!staff) return { error: 'Tu acceso está inactivo' }
  if (staff.event.status !== 'ACTIVE') {
    return { error: 'El evento está cerrado' }
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.guest.updateMany({
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
    })

    if (updated.count !== 1) {
      return { ok: false as const }
    }

    await tx.accessLog.create({
      data: {
        organizationId: staff.organizationId,
        eventId: staff.eventId,
        guestId,
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
    )
    if (!staff?.canUndoCheckIn) {
      return { error: 'No tienes permiso para deshacer check-ins' }
    }
    staffId = staff.id
  }

  await prisma.$transaction(async (tx) => {
    await tx.guest.update({
      where: { id: guest.id },
      data: { status: 'INVITED', checkedInAt: null, checkedInById: null },
    })
    await tx.accessLog.create({
      data: {
        organizationId: guest.organizationId,
        eventId: guest.eventId,
        guestId: guest.id,
        staffId,
        action: 'UNDO_CHECK_IN',
      },
    })
  })

  revalidatePath(`/staff/event/${guest.eventId}`, 'layout')
  revalidatePath(`/dashboard/events/${guest.eventId}`, 'layout')
  return { success: true }
}
