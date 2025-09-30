import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(_req) {
    // Middleware logic zde (pokud je potřeba)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Pokud je uživatel na auth stránce, povolit přístup
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true
        }
        
        // Pro ostatní chráněné cesty vyžadovat přihlášení
        return !!token
      }
    },
    pages: {
      signIn: '/auth/signin',
    }
  }
)

// Konfigurovat cesty, které má middleware chránit
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/certificate/:path*',
    // Nepoužívat middleware pro tyto cesty:
    '/((?!api|_next/static|_next/image|favicon.ico|images|auth|chapters|arena|$).*)',
  ]
}