import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'
import prisma from '@/lib/prisma'
import { LoginSchema, StaffCodeSchema } from '@/lib/validations/auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Organizador',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(raw) {
        const parsed = LoginSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { organization: true },
        })
        if (!user?.organization) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'OWNER' as const,
          organizationId: user.organization.id,
        }
      },
    }),
    Credentials({
      id: 'staff-code',
      name: 'Código de ayudante',
      credentials: {
        code: { label: 'Código', type: 'text' },
      },
      async authorize(raw) {
        const parsed = StaffCodeSchema.safeParse(raw)
        if (!parsed.success) return null

        const staff = await prisma.staff.findUnique({
          where: { code: parsed.data.code },
          include: { event: true },
        })
        if (!staff?.active || staff.event.status !== 'ACTIVE') return null

        await prisma.staff.update({
          where: { id: staff.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: staff.id,
          name: staff.name,
          role: 'STAFF' as const,
          organizationId: staff.organizationId,
          staffId: staff.id,
          eventId: staff.eventId,
          staffSessionVersion: staff.sessionVersion,
        }
      },
    }),
  ],
})
