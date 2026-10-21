import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe Auth.js configuration.
 *
 * Prisma and bcrypt live in `auth.ts`; this file only needs the JWT
 * callbacks so the Proxy can decode the session without Node-only code.
 */
export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.organizationId = user.organizationId
        token.staffId = user.staffId
        token.eventId = user.eventId
        token.permissions = user.permissions
      }
      return token
    },
    session({ session, token }) {
      const claims = token as unknown as {
        sub?: string
        role?: 'OWNER' | 'STAFF'
        organizationId?: string
        staffId?: string
        eventId?: string
        permissions?: typeof session.user.permissions
      }

      if (session.user) {
        session.user.id = claims.sub ?? ''
        session.user.role = claims.role ?? 'OWNER'
        session.user.organizationId = claims.organizationId ?? ''
        session.user.staffId = claims.staffId
        session.user.eventId = claims.eventId
        session.user.permissions = claims.permissions
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
