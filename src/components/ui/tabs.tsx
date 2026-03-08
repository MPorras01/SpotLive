import * as React from 'react';

export function Tabs({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

export const TabsList = ({ children }: { children: React.ReactNode }) => <div className="flex gap-2">{children}</div>;
export const TabsTrigger = ({ children }: { children: React.ReactNode }) => (
  <button type="button" className="rounded-md border border-gray-200 px-3 py-1 text-sm">
    {children}
  </button>
);
export const TabsContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
