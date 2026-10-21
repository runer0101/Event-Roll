import type { DefaultSession } from 'next-auth'
import type { StaffPermissions } from '@/lib/permissions'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'OWNER' | 'STAFF'
      organizationId: string
      staffId?: string
      eventId?: string
      permissions?: StaffPermissions
    } & DefaultSession['user']
  }

  interface User {
    role: 'OWNER' | 'STAFF'
    organizationId: string
    staffId?: string
    eventId?: string
    permissions?: StaffPermissions
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: 'OWNER' | 'STAFF'
    organizationId: string
    staffId?: string
    eventId?: string
    permissions?: StaffPermissions
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'OWNER' | 'STAFF'
    organizationId: string
    staffId?: string
    eventId?: string
    permissions?: StaffPermissions
  }
}
