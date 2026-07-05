import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-warning mb-2" />
          <h3 className="text-sm font-medium text-foreground mb-1">Something went wrong</h3>
          <p className="text-2xs text-muted mb-3 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button variant="secondary" size="sm" onClick={this.handleReset}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
