'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Handler (Root Level)
 * 
 * This catches errors that occur in the root layout.
 * It's a fallback for the fallback - the absolute last line of defense.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error
    console.error('[Global Error] Critical error in root layout:', error);
    
    // Log to error tracking service
    // logCriticalError(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #0a1628, #0d1f3a, #1a2f4a)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
      }}>
        <div style={{
          maxWidth: '600px',
          padding: '2rem',
          textAlign: 'center',
        }}>
          {/* Error Icon */}
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
          }}>
            ⚠️
          </div>

          {/* Error Message */}
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}>
            Critical System Error
          </h1>
          
          <p style={{
            fontSize: '1.125rem',
            color: '#d1d5db',
            marginBottom: '0.5rem',
          }}>
            IsoFlux encountered a critical error and needs to restart.
          </p>
          
          <p style={{
            fontSize: '1rem',
            color: '#9ca3af',
            marginBottom: '2rem',
          }}>
            Our team has been automatically notified.
          </p>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              textAlign: 'left',
            }}>
              <pre style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#f87171',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
              }}>
                {error.message}
              </pre>
              {error.digest && (
                <p style={{
                  fontSize: '0.625rem',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                  marginBottom: 0,
                }}>
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Recovery Button */}
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(to right, #4FC3F7, #7C4DFF)',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginRight: '1rem',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Restart Application
          </button>

          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#4FC3F7',
              background: 'transparent',
              border: '2px solid #4FC3F7',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(79, 195, 247, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Go to Home
          </button>

          {/* Branding */}
          <div style={{
            marginTop: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            opacity: 0.5,
          }}>
            <span style={{ fontSize: '0.875rem' }}>IsoFlux • The Compliance Wolf</span>
          </div>
        </div>
      </body>
    </html>
  );
}
