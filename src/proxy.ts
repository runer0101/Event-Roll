import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((request) => {
  const { pathname } = request.nextUrl
  const user = request.auth?.user

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (user.role !== 'OWNER') {
      const target = user.eventId ? `/staff/event/${user.eventId}` : '/staff'
      return NextResponse.redirect(new URL(target, request.url))
    }
  }

  if (pathname.startsWith('/staff/event')) {
    if (!user) {
      return NextResponse.redirect(new URL('/staff', request.url))
    }
    if (user.role !== 'STAFF') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/staff/event/:path*'],
}
