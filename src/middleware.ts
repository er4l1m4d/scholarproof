import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to extract the dashboard type from the pathname
function getDashboardRole(pathname: string): 'student' | 'lecturer' | 'admin' | null {
  if (pathname.startsWith('/dashboard/student')) return 'student';
  if (pathname.startsWith('/dashboard/lecturer')) return 'lecturer';
  if (pathname.startsWith('/dashboard/admin')) return 'admin';
  return null;
}

// Helper to decode JWT and extract user ID (sub claim)
function parseJwt(token: string) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const dashboardRole = getDashboardRole(pathname);
  if (!dashboardRole) return NextResponse.next(); // Not a dashboard route

  // Get the user's session from cookies (Supabase Auth)
  const supabaseToken = request.cookies.get('sb-access-token')?.value;
  if (!supabaseToken) {
    // Not logged in
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Decode JWT to get user ID
  const jwt = parseJwt(supabaseToken);
  const userId = jwt?.sub;
  if (!userId) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Fetch user role from Supabase (API call)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const userRes = await fetch(`${supabaseUrl}/rest/v1/users?select=role&id=eq.${userId}`, {
    headers: {
      'apikey': supabaseAnonKey || '',
      'Authorization': `Bearer ${supabaseToken}`,
    },
    next: { revalidate: 0 },
  });
  const userData = await userRes.json();
  const userRole = userData?.[0]?.role;

  if (userRole !== dashboardRole) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 