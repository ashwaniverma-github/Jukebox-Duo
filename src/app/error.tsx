'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to console for debugging
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white px-4">
            <div className="text-center max-w-md">
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
                <p className="text-zinc-400 mb-6">
                    We encountered an unexpected error. This might be due to network issues or temporary service unavailability.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold transition-all duration-200"
                    >
                        Go to Home
                    </button>
                </div>

                {error.digest && (
                    <p className="mt-6 text-xs text-zinc-600">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    )
}
