'use client';

import { usePathname } from 'next/navigation';

import { Navbar } from '@/components/shared/Navbar';

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isMapRoute = pathname === '/map';

  if (isMapRoute) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl p-6">{children}</main>
    </div>
  );
}
