import type { UserRole } from '@spotlive/types';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export interface SessionProfile {
  userId: string;
  email: string;
  role: UserRole | null;
}

function getBearerToken(request?: Request): string | null {
  const header = request?.headers.get('authorization') ?? request?.headers.get('Authorization');
  if (!header) {
    return null;
  }

  const [type, token] = header.split(' ');
  if (type?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

export async function getCurrentSessionProfile(request?: Request): Promise<SessionProfile | null> {
  const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!hasEnv) {
    return null;
  }

  const bearerToken = getBearerToken(request);
  if (bearerToken) {
    const adminClient = createAdminClient();
    const { data: userData, error: authError } = await adminClient.auth.getUser(bearerToken);

    if (authError || !userData.user) {
      return null;
    }

    const { data: profile } = await adminClient
      .from('users')
      .select('role')
      .eq('id', userData.user.id)
      .eq('is_deleted', false)
      .maybeSingle();

    return {
      userId: userData.user.id,
      email: userData.user.email ?? '',
      role: (profile?.role as UserRole | undefined) ?? null,
    };
  }

  const supabase = createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', userData.user.id)
    .eq('is_deleted', false)
    .maybeSingle();

  return {
    userId: userData.user.id,
    email: userData.user.email ?? '',
    role: (profile?.role as UserRole | undefined) ?? null,
  };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await getCurrentSessionProfile();
  return session?.role === 'admin';
}
