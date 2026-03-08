import * as React from 'react';

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}

export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 w-48 rounded-md border border-gray-200 bg-white p-2 shadow">{children}</div>
);
export const DropdownMenuItem = ({ children }: { children: React.ReactNode }) => (
  <button type="button" className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-100">
    {children}
  </button>
);
