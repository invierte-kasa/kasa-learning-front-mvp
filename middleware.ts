import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cookie name for shared authentication
const AUTH_COOKIE_NAME = 'kasa_session'

// Routes that require authentication
const protectedRoutes = ['/profile', '/quiz', '/lesson']

// Routes that are always public
const publicRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Get authentication cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  const isAuthenticated = !!authCookie?.value

  // In development, allow all routes
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from public routes
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
