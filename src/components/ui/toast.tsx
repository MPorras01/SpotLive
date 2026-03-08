import * as React from 'react';

export function Toast({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-gray-200 bg-white p-3 text-sm shadow">{children}</div>;
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const ToastViewport = () => <div aria-hidden="true" />;
