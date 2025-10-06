'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-sm border-2 border-red-500/30 rounded-lg p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-red-500">Oops!</span> <span className="text-white">Something went wrong</span>
          </h1>
          <p className="text-xl text-gray-300">We're sorry about that.</p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-3">Error Details:</h2>
          <div className="bg-black/30 rounded p-4 font-mono text-sm text-red-400 break-all">
            {error.message || 'Unknown error occurred'}
            {error.digest && (
              <div className="mt-2 text-gray-400">
                Error ID: {error.digest}
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-300 mb-6 text-center">
          Please send us a message with the error details above so we can fix this issue.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/#contact'}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Contact Us About This Error
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Home
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>You can also reach us at:</p>
          <p className="mt-2">
            <a href="tel:801-899-9406" className="text-blue-400 hover:underline">
              (801) 899-9406
            </a>
          </p>
          <p className="mt-2">
            <a href="mailto:kylefox@foxbuilt.com" className="text-blue-400 hover:underline">
              kylefox@foxbuilt.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
