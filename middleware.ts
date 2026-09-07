import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'cukur_admin_session';

async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/login') && !pathname.startsWith('/api/public');

  if (isAdminRoute) {
    const authed = await isAuthenticated(req);
    if (!authed) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (
    isAdminApi &&
    (pathname.startsWith('/api/categories') ||
      pathname.startsWith('/api/menu-items') ||
      pathname.startsWith('/api/upload') ||
      pathname.startsWith('/api/settings') ||
      pathname.startsWith('/api/dietary-tags') ||
      pathname.startsWith('/api/allergens'))
  ) {
    // Allow public GET requests (customer menu reads), protect mutating requests.
    if (req.method !== 'GET') {
      const authed = await isAuthenticated(req);
      if (!authed) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/categories/:path*',
    '/api/menu-items/:path*',
    '/api/upload/:path*',
    '/api/settings/:path*',
    '/api/dietary-tags/:path*',
    '/api/allergens/:path*',
  ],
};
