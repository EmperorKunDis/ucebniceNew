import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/learn',
  '/shop',
  '/friends',
  '/ai-tutor',
  '/settings',
  '/certificate',
  '/quests',
  '/leagues',
  '/notifications',
  '/review',
  '/profile',
]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (token && pathname === '/auth/signin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname

        if (pathname.startsWith('/auth')) return true

        return protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
          ? !!token
          : true
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    '/auth/signin',
    '/dashboard/:path*',
    '/learn/:path*',
    '/shop/:path*',
    '/friends/:path*',
    '/ai-tutor/:path*',
    '/settings/:path*',
    '/certificate/:path*',
    '/quests/:path*',
    '/leagues/:path*',
    '/notifications/:path*',
    '/review/:path*',
    '/profile/:path*',
  ],
}
