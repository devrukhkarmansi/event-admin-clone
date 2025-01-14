import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')
  const isAuthPage = request.nextUrl.pathname === '/login'

  if (!accessToken && !isAuthPage) {
    // Redirect to login if accessing protected route without token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (accessToken && isAuthPage) {
    // Redirect to dashboard if accessing login page with valid token
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
