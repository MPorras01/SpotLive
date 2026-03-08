import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-start justify-center gap-4 p-6">
      <h1 className="text-4xl font-semibold text-primary">SpotLive</h1>
      <p className="text-gray-600">Descubre eventos en vivo en Medellin.</p>
      <Link href="/map" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
        Ir al mapa
      </Link>
    </main>
  );
}
