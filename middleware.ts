import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware if credentials are not configured
  const basicUser = process.env.DASH_BASIC_USER;
  const basicPass = process.env.DASH_BASIC_PASS;
  
  if (!basicUser || !basicPass) {
    return NextResponse.next();
  }

  // Check if user is already authenticated
  const authCookie = request.cookies.get('ig_auth');
  if (authCookie?.value === '1') {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}; 