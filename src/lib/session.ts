import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export type OwnerSession = {
  userId: string
  name: string
  email: string
  organizationId: string
}

export type StaffSession = {
  staffId: string
  eventId: string
  organizationId: string
  name: string
}

export async function requireOwner(): Promise<OwnerSession> {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'OWNER') {
    redirect('/login')
  }

  return {
    userId: user.id,
    name: user.name ?? '',
    email: user.email ?? '',
    organizationId: user.organizationId,
  }
}

export async function requireStaff(): Promise<StaffSession> {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'STAFF' || !user.staffId || !user.eventId) {
    redirect('/staff')
  }

  return {
    staffId: user.staffId,
    eventId: user.eventId,
    organizationId: user.organizationId,
    name: user.name ?? '',
  }
}
