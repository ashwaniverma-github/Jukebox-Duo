import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white px-4">
            <div className="text-center max-w-md">
                <div className="mb-6">
                    <div className="text-8xl font-bold bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
                        404
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">Page not found</h2>
                <p className="text-zinc-400 mb-6">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
                >
                    Go to Home
                </Link>
            </div>
        </div>
    )
}
