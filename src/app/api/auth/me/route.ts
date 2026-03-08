import { NextResponse } from 'next/server';

import { getCurrentSessionProfile } from '@/lib/supabase/auth';

export async function GET() {
  const session = await getCurrentSessionProfile();
  return NextResponse.json({ session });
}
