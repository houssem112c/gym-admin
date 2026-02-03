import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only apply to admin routes (except login page)
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verify token and check admin role
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-admin`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorResponse = NextResponse.redirect(new URL('/', request.url));
      errorResponse.cookies.delete('admin_token');
      return errorResponse;
    }

    const userData = await response.json();

    if (userData.role !== 'ADMIN' && userData.role !== 'COACH') {
      const errorResponse = NextResponse.redirect(new URL('/', request.url));
      errorResponse.cookies.delete('admin_token');
      return errorResponse;
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    const errorResponse = NextResponse.redirect(new URL('/', request.url));
    errorResponse.cookies.delete('admin_token');
    return errorResponse;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/contacts/:path*',
    '/courses/:path*',
    '/videos/:path*',
    '/locations/:path*',
    '/schedules/:path*',
  ],
};