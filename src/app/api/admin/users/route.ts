import { NextResponse } from 'next/server';

import { getCurrentSessionProfile } from '@/lib/supabase/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const session = await getCurrentSessionProfile(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name, role, created_at, is_deleted')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load users' },
      { status: 500 },
    );
  }
}
