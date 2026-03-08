'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'No se pudo iniciar sesion.');
      }

      router.push('/admin');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error iniciando sesion.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Iniciar sesion</h1>
      <p className="text-sm text-gray-500">Ingresa para acceder al panel de moderacion.</p>

      <form className="space-y-3 rounded-lg border border-gray-200 bg-white p-4" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
            placeholder="admin@spotlive.app"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
            placeholder="********"
          />
        </div>

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
