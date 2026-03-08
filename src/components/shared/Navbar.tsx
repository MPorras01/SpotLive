import Link from 'next/link';

const navItems = [
  { href: '/map', label: 'Mapa' },
  { href: '/events', label: 'Eventos' },
  { href: '/profile', label: 'Perfil' },
];

export function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/map" className="text-base font-semibold text-primary">
          SpotLive
        </Link>
        <div className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-gray-600 hover:text-gray-900">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
