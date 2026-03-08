import * as React from 'react';

import { cn } from '@/lib/utils';

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-10 w-10 overflow-hidden rounded-full bg-gray-200', className)} {...props} />;
}

export const AvatarImage = ({ alt, src }: { alt: string; src: string }) => (
  <img alt={alt} src={src} className="h-full w-full object-cover" />
);
export const AvatarFallback = ({ children }: { children: React.ReactNode }) => <span className="grid h-full w-full place-items-center text-xs">{children}</span>;
