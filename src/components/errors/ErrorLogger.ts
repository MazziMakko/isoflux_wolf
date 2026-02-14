/**
 * Error Logger Utility
 * 
 * Centralized error logging for the application.
 * Integrates with monitoring services like Sentry, DataDog, etc.
 */

export interface ErrorLogContext {
  userId?: string;
  route?: string;
  timestamp?: Date;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorLog {
  error: Error;
  severity: ErrorSeverity;
  context: ErrorLogContext;
}

/**
 * Log error to console and monitoring service
 */
export function logError(
  error: Error,
  severity: ErrorSeverity = 'medium',
  context: ErrorLogContext = {}
): void {
  const errorLog: ErrorLog = {
    error,
    severity,
    context: {
      ...context,
      timestamp: new Date(),
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    },
  };

  // Console logging (development)
  if (process.env.NODE_ENV === 'development') {
    console.group(`[Error Logger] ${severity.toUpperCase()}`);
    console.error('Error:', error);
    console.log('Context:', errorLog.context);
    console.groupEnd();
  }

  // Send to error tracking service (production)
  if (process.env.NODE_ENV === 'production') {
    sendToErrorTrackingService(errorLog);
  }

  // Store in local storage for debugging
  storeErrorLocally(errorLog);
}

/**
 * Send error to monitoring service (e.g., Sentry, DataDog)
 */
function sendToErrorTrackingService(errorLog: ErrorLog): void {
  // TODO: Integrate with your error tracking service
  
  // Example for Sentry:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(errorLog.error, {
  //     level: errorLog.severity,
  //     extra: errorLog.context,
  //   });
  // }

  // Example for custom API:
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     message: errorLog.error.message,
  //     stack: errorLog.error.stack,
  //     severity: errorLog.severity,
  //     context: errorLog.context,
  //   }),
  // });
}

/**
 * Store error locally for debugging
 */
function storeErrorLocally(errorLog: ErrorLog): void {
  if (typeof window === 'undefined') return;

  try {
    const key = 'isoflux_error_logs';
    const existingLogs = localStorage.getItem(key);
    const logs = existingLogs ? JSON.parse(existingLogs) : [];

    // Store only last 50 errors
    const updatedLogs = [
      {
        message: errorLog.error.message,
        stack: errorLog.error.stack,
        severity: errorLog.severity,
        context: errorLog.context,
      },
      ...logs,
    ].slice(0, 50);

    localStorage.setItem(key, JSON.stringify(updatedLogs));
  } catch (err) {
    // Fail silently if localStorage is unavailable
    console.warn('Could not store error locally:', err);
  }
}

/**
 * Get stored error logs
 */
export function getStoredErrors(): ErrorLog[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = 'isoflux_error_logs';
    const logs = localStorage.getItem(key);
    return logs ? JSON.parse(logs) : [];
  } catch (err) {
    console.warn('Could not retrieve stored errors:', err);
    return [];
  }
}

/**
 * Clear stored error logs
 */
export function clearStoredErrors(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('isoflux_error_logs');
  } catch (err) {
    console.warn('Could not clear stored errors:', err);
  }
}

/**
 * Log navigation error (404, invalid route, etc.)
 */
export function logNavigationError(route: string, reason: string): void {
  logError(
    new Error(`Navigation error: ${reason}`),
    'low',
    {
      route,
      metadata: { reason, type: 'navigation' },
    }
  );
}

/**
 * Log API error
 */
export function logApiError(
  endpoint: string,
  status: number,
  error: Error
): void {
  logError(
    error,
    status >= 500 ? 'high' : 'medium',
    {
      metadata: {
        endpoint,
        status,
        type: 'api',
      },
    }
  );
}

/**
 * Log component error
 */
export function logComponentError(
  componentName: string,
  error: Error
): void {
  logError(
    error,
    'medium',
    {
      metadata: {
        component: componentName,
        type: 'component',
      },
    }
  );
}
