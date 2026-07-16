"use client";

import * as React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: (reset: () => void) => React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (this.state.error) return this.props.fallback(this.reset);

    return this.props.children;
  }
}
