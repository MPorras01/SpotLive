'use client';

import { useEffect, useState } from 'react';

import type { UserRole } from '@spotlive/types';

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

const roles: UserRole[] = ['visitor', 'user', 'verified_organizer', 'admin', 'advertiser'];

export function UserRoleManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  async function loadUsers() {
    setIsLoading(true);
    setFeedback('');

    try {
      const response = await fetch('/api/admin/users');
      const payload = (await response.json().catch(() => ({}))) as { users?: AdminUser[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'No se pudo cargar usuarios.');
      }

      setUsers(payload.users ?? []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Error cargando usuarios.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function updateRole(userId: string, role: UserRole) {
    setSavingUserId(userId);
    setFeedback('');

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'No se pudo actualizar el rol.');
      }

      setUsers((currentUsers) => currentUsers.map((user) => (user.id === userId ? { ...user, role } : user)));
      setFeedback('Rol actualizado correctamente.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Error actualizando rol.');
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Gestion de roles</h2>
        <p className="text-sm text-gray-600">Administra permisos de usuarios autenticados.</p>
      </div>

      {feedback ? <p className="text-sm text-amber-700">{feedback}</p> : null}

      {isLoading ? <p className="text-sm text-gray-600">Cargando usuarios...</p> : null}

      {!isLoading && users.length === 0 ? <p className="text-sm text-gray-600">No hay usuarios disponibles.</p> : null}

      {!isLoading && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-3 py-2 font-medium">Usuario</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Rol</th>
                <th className="px-3 py-2 font-medium">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-2 text-gray-800">{user.display_name || 'Sin nombre'}</td>
                  <td className="px-3 py-2 text-gray-600">{user.email}</td>
                  <td className="px-3 py-2">
                    <select
                      value={user.role}
                      disabled={savingUserId === user.id}
                      onChange={(event) => {
                        const nextRole = event.target.value as UserRole;
                        setUsers((currentUsers) =>
                          currentUsers.map((item) => (item.id === user.id ? { ...item, role: nextRole } : item)),
                        );
                      }}
                      className="h-9 rounded-md border border-gray-300 px-2"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={savingUserId === user.id}
                      onClick={() => updateRole(user.id, user.role)}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
