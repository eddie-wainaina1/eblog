import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const COOKIE_NAME = 'auth-token'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all admin dashboard routes
  if (pathname.startsWith('/admin/dashboard')) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL('/admin', request.url))
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
