import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;

  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y password son obligatorios.' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'No se pudo iniciar sesion.' }, { status: 401 });
  }

  const displayName = data.user.user_metadata?.display_name as string | undefined;
  const safeDisplayName = displayName?.trim() || email.split('@')[0] || 'Usuario SpotLive';

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (existingProfileError) {
    return NextResponse.json({ success: true, warning: existingProfileError.message });
  }

  const { error: profileError } = existingProfile
    ? await supabase
        .from('users')
        .update({
          email,
          display_name: safeDisplayName,
          is_deleted: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id)
    : await supabase.from('users').insert({
        id: data.user.id,
        email,
        display_name: safeDisplayName,
        role: 'user',
        is_deleted: false,
      });

  if (profileError) {
    // Comentario de negocio: si falla sincronizacion de perfil, mantenemos sesion activa y reportamos advertencia.
    return NextResponse.json({ success: true, warning: profileError.message });
  }

  return NextResponse.json({ success: true });
}
