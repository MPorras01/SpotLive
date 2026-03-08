'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    console.error('Error en componente:', error);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return <p className="text-sm text-red-600">Ocurrio un error en la interfaz.</p>;
    }

    return this.props.children;
  }
}
