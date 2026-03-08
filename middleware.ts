import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

const authRoutes = ['/login', '/register'];
const protectedRoutes = ['/admin', '/events', '/map', '/profile'];

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}

function redirectWithCookies(request: NextRequest, response: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  const redirectResponse = NextResponse.redirect(url);
  copyCookies(response, redirectResponse);
  return redirectResponse;
}

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string) {
        request.cookies.set({ name, value });
        response.cookies.set({ name, value });
      },
      remove(name: string) {
        request.cookies.set({ name, value: '' });
        response.cookies.set({ name, value: '' });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const inAuthRoute = isRouteMatch(pathname, authRoutes);
  const inProtectedRoute = isRouteMatch(pathname, protectedRoutes);
  const inAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  // Comentario de negocio: usuarios sin sesion no deben navegar vistas privadas.
  if (inProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (inAdminRoute && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .eq('is_deleted', false)
      .maybeSingle();

    // Comentario de negocio: solo administradores pueden entrar al panel /admin.
    if (profile?.role !== 'admin') {
      return redirectWithCookies(request, response, '/map');
    }
  }

  if (inAuthRoute && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .eq('is_deleted', false)
      .maybeSingle();

    return redirectWithCookies(request, response, profile?.role === 'admin' ? '/admin' : '/map');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
