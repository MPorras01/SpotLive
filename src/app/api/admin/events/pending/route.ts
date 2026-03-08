import { NextResponse } from 'next/server';

import { getCurrentSessionProfile } from '@/lib/supabase/auth';
import { getPendingModerationEvents } from '@/lib/supabase/queries';

export async function GET(request: Request) {
  const session = await getCurrentSessionProfile(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const events = await getPendingModerationEvents();
  return NextResponse.json({ events });
}
