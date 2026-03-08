import * as React from 'react';

export function Dialog({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 bg-white p-4">{children}</div>;
}

export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="space-y-2">{children}</div>;
export const DialogTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-semibold">{children}</h3>;
export const DialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-gray-500">{children}</p>;
