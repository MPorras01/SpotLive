import Link from 'next/link';

import { UserRoleManager } from '@/components/admin/UserRoleManager';
import { EventModerationTable } from '@/components/events/EventModerationTable';
import { getCurrentSessionProfile } from '@/lib/supabase/auth';

export default async function AdminPage() {
  const session = await getCurrentSessionProfile();

  if (!session) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Panel de moderacion</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Debes iniciar sesion para acceder al panel.
          <div className="mt-2">
            <Link href="/login" className="font-medium text-amber-900 underline">
              Ir a login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (session.role !== 'admin') {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Panel de moderacion</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Tu rol actual no tiene permisos de moderacion. Solo administradores pueden aprobar o rechazar eventos.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Panel de moderacion</h1>
        <p className="text-sm text-gray-600">Revision de eventos pendientes para aprobar o rechazar.</p>
      </div>

      <UserRoleManager />
      <EventModerationTable />
    </section>
  );
}
