import * as React from 'react';

export function Sheet({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export const SheetTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SheetContent = ({ children }: { children: React.ReactNode }) => (
  <aside className="rounded-lg border border-gray-200 bg-white p-4">{children}</aside>
);
