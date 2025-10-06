'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #1e293b, #334155, #27272a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '800px',
            width: '100%',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(12px)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: 'white'
              }}>
                <span style={{ color: '#ef4444' }}>Oops!</span> Something went wrong
              </h1>
              <p style={{ fontSize: '20px', color: '#d1d5db' }}>
                We're sorry about that.
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #475569'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '12px'
              }}>
                Error Details:
              </h2>
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#f87171',
                wordBreak: 'break-all'
              }}>
                {error.message || 'Unknown error occurred'}
                {error.digest && (
                  <div style={{ marginTop: '8px', color: '#9ca3af' }}>
                    Error ID: {error.digest}
                  </div>
                )}
              </div>
            </div>

            <p style={{
              color: '#d1d5db',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Please send us a message with the error details above so we can fix this issue.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button
                onClick={reset}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/#contact'}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Contact Us About This Error
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: '#475569',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#475569'}
              >
                Go Home
              </button>
            </div>

            <div style={{
              marginTop: '32px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#9ca3af'
            }}>
              <p>You can also reach us at:</p>
              <p style={{ marginTop: '8px' }}>
                <a
                  href="tel:801-899-9406"
                  style={{
                    color: '#60a5fa',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  (801) 899-9406
                </a>
              </p>
              <p style={{ marginTop: '8px' }}>
                <a
                  href="mailto:kylefox@foxbuilt.com"
                  style={{
                    color: '#60a5fa',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  kylefox@foxbuilt.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
