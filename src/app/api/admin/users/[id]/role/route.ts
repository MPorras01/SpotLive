import type { UserRole } from '@spotlive/types';
import { NextResponse } from 'next/server';

import { getCurrentSessionProfile } from '@/lib/supabase/auth';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: {
    id: string;
  };
}

const allowedRoles: UserRole[] = ['visitor', 'user', 'verified_organizer', 'admin', 'advertiser'];

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getCurrentSessionProfile(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { role?: UserRole } | null;
  if (!body || !body.role || !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role value' }, { status: 400 });
  }

  if (params.id === session.userId && body.role !== 'admin') {
    return NextResponse.json({ error: 'No puedes quitarte el rol admin desde esta vista.' }, { status: 400 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role: body.role, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select('id, role')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update role' },
      { status: 500 },
    );
  }
}
