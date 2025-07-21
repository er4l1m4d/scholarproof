import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

function getDashboardRole(pathname: string): 'student' | 'lecturer' | 'admin' | null {
  if (pathname.startsWith('/dashboard/student')) return 'student';
  if (pathname.startsWith('/dashboard/lecturer')) return 'lecturer';
  if (pathname.startsWith('/dashboard/admin')) return 'admin';
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const dashboardRole = getDashboardRole(pathname);
  if (!dashboardRole) return NextResponse.next();

  // Create a Supabase client with the request and response
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Get the session and user
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  const userId = session.user.id;

  // Fetch the user's role from the users table
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !userData) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  const userRole = userData.role;

  if (userRole !== dashboardRole) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 