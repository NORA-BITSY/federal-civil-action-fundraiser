import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Paths that stay public (marketing + auth + webhooks)
const PUBLIC_PATHS = [
  '/',
  '/about',
  '/how-it-works',
  '/success-stories',
  '/support',
  '/auth/login',
  '/auth/register',
  '/api/auth',
  '/api/webhooks/stripe',
  '/api/webhooks/stripe-sub',
  '/api/test-db',
]

// Paths that require authentication but not parent verification
const AUTH_ONLY_PATHS = [
  '/onboarding',
  '/verify',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check authentication
  const token = await getToken({ req })
  if (!token) {
    const url = new URL('/auth/login', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Allow auth-only paths for logged in users
  if (AUTH_ONLY_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Parents-only areas (dashboard, vault, copilot, campaigns)
  const parentsOnlyPaths = ['/dashboard', '/vault', '/copilot', '/campaigns']
  const isParentsOnlyArea = parentsOnlyPaths.some(p => pathname.startsWith(p))
  
  if (isParentsOnlyArea && !token.isParentVerified) {
    // Redirect to verification if not a verified parent
    if (pathname.startsWith('/verify')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/verify/wizard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico|images|brand).*)'],
}