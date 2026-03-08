import { NextResponse } from 'next/server';

import { getCurrentSessionProfile } from '@/lib/supabase/auth';
import { updateModerationEventStatus } from '@/lib/supabase/queries';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getCurrentSessionProfile(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { status?: string } | null;

  if (!body || (body.status !== 'approved' && body.status !== 'rejected')) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const result = await updateModerationEventStatus(params.id, body.status);

  if (!result.success) {
    return NextResponse.json({ error: result.message ?? 'Unable to update event status' }, { status: 500 });
  }

  return NextResponse.json({ success: true, source: result.source, message: result.message });
}
