'use client';

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import BouncyButton from '@/components/ui/BouncyButton';
import FloatingText from '@/components/ui/FloatingText';
import { ROUTES } from '@/lib/navigation/routes';
import { logComponentError } from './ErrorLogger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * React Error Boundary for catching and handling errors in component tree.
 * Provides graceful error recovery and user-friendly error messages.
 * 
 * Features:
 * - Catches React errors in child components
 * - Displays friendly error UI
 * - Logs errors automatically
 * - Allows recovery without full page refresh
 * - Optional custom fallback UI
 * 
 * @param children - Components to wrap
 * @param fallback - Custom error UI
 * @param onError - Error callback
 * @param showDetails - Show error details in UI
 * @param componentName - Name for error logging
 * 
 * @example
 * ```tsx
 * <ErrorBoundary componentName="UserProfile">
 *   <UserProfileComponent />
 * </ErrorBoundary>
 * ```
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Log error
    logComponentError(this.props.componentName || 'Unknown', error);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-xl w-full text-center">
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
                <FloatingText className="text-4xl" amplitude={8} duration={2}>
                  ⚠️
                </FloatingText>
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-3">
                Component Error
              </h2>
              <p className="text-gray-300 mb-6">
                This section encountered an error and couldn&apos;t load.
              </p>

              {/* Error Details (Development) */}
              {this.props.showDetails && this.state.error && process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-400">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Recovery Options */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <BouncyButton
                  to={ROUTES.HOME}
                  variant="primary"
                  size="md"
                  onClick={this.resetError}
                >
                  Try Again
                </BouncyButton>
                <BouncyButton
                  to={ROUTES.ISOFLUX}
                  variant="outline"
                  size="md"
                >
                  Go to Home
                </BouncyButton>
              </div>
            </motion.div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  fallback?: ReactNode
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary componentName={componentName} fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
