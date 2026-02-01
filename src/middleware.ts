import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('sb-cc006180-e961-4da4-809c-134960e6d55a-auth-token');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[MIDDLEWARE] Request:', request.nextUrl.pathname);
    console.log('[MIDDLEWARE] All cookies:', request.cookies.getAll().map(c => c.name));
    if (cookie) {
      console.log('[MIDDLEWARE] Auth token found:', cookie.name);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
