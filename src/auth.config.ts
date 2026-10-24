import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe Auth.js configuration.
 *
 * Prisma and bcrypt live in `auth.ts`; this file only needs the JWT
 * callbacks so the Proxy can decode the session without Node-only code.
 */
export const authConfig = {
  pages: { signIn: '/login' },
  session: {
    strategy: 'jwt',
    // Event staff work a single day; a longer window only increases the blast
    // radius of a leaked cookie.
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.organizationId = user.organizationId
        token.staffId = user.staffId
        token.eventId = user.eventId
        token.staffSessionVersion = user.staffSessionVersion
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
        staffSessionVersion?: number
      }

      if (session.user) {
        session.user.id = claims.sub ?? ''
        // Fail closed: a token without a role must never become an organizer.
        session.user.role = claims.role ?? 'STAFF'
        session.user.organizationId = claims.organizationId ?? ''
        session.user.staffId = claims.staffId
        session.user.eventId = claims.eventId
        session.user.staffSessionVersion = claims.staffSessionVersion
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
