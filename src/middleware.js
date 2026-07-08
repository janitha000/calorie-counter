import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Protect all main app routes except login
  if (pathname === '/' || pathname.startsWith('/log') || pathname.startsWith('/stats') || pathname.startsWith('/profile')) {
    const pin = request.cookies.get('auth_pin')
    
    if (pin?.value !== 'valid') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If they are on /login but already have the pin, redirect to dashboard
  if (pathname === '/login') {
    const pin = request.cookies.get('auth_pin')
    if (pin?.value === 'valid') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
