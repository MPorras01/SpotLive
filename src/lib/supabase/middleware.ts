import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase middleware environment variables.');
  }

  const response = NextResponse.next({ request });

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

  const { error } = await supabase.auth.getUser();

  if (error) {
    // Comentario de negocio: si falla la sesion, mantenemos respuesta neutra para no romper navegacion.
    console.error('Supabase session refresh error:', error.message);
  }

  return response;
}
