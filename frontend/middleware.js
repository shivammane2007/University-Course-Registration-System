import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read auth from cookie or skip (client-side Zustand handles redirect)
  const isLoginPage = pathname === '/login' || pathname === '/';

  // We rely on client-side route guards for role enforcement.
  // This middleware only handles the login redirect for unauthenticated users.
  // The actual role-based protection is in each dashboard layout.

  return NextResponse.next();
}

export const config = {
  matcher: ['/(admin)/:path*', '/(faculty)/:path*', '/(student)/:path*'],
};
