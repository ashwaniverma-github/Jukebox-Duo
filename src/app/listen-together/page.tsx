import { Metadata } from 'next';
import Link from 'next/link';
import { listenTogetherPages } from '@/lib/seo-data';
import Footer from '@/components/Footer';
import { CONFIG } from '@/lib/config';

export const metadata: Metadata = {
    title: 'Listen Together - Artists, Genres & Moods | Jukebox Duo',
    description: 'Browse all our Listen Together categories. Sync music with friends for your favorite artists, genres, and moods.',
    alternates: {
        canonical: 'https://jukeboxduo.com/listen-together',
    },
};

export default function ListenTogetherHub() {
    // Group pages by category
    const artists = listenTogetherPages.filter(p => p.category === 'artist');
    const genres = listenTogetherPages.filter(p => p.category === 'genre');
    const moods = listenTogetherPages.filter(p => p.category === 'mood');

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-red-500/30">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-40" />
            </div>

            {/* Navbar */}
            <nav className={`fixed ${CONFIG.MAINTENANCE_MODE ? 'top-10' : 'top-0'} left-0 w-full flex items-center justify-between px-6 py-4 z-50 backdrop-blur-md bg-black/20 border-b border-white/5`}>
                <Link href="/" className="font-bold text-xl tracking-tight text-white">
                    Jukebox<span className="text-red-500 ml-1">Duo</span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        About
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/signin"
                        className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="relative pt-32 pb-20 px-4 container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Listen Together Categories
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Explore all the ways you can share music with friends. Browse by artist, genre, or mood.
                    </p>
                </div>

                {/* Artists Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </span>
                        Popular Artists
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {artists.map((page) => (
                            <Link
                                key={page.slug}
                                href={`/listen-together/${page.slug}`}
                                className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:scale-[1.02]"
                            >
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-red-400 transition-colors">
                                    {page.heroTitle.replace('Listen to ', '').replace(' Together', '')}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {page.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Genres Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-500 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        </span>
                        Genres
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {genres.map((page) => (
                            <Link
                                key={page.slug}
                                href={`/listen-together/${page.slug}`}
                                className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:scale-[1.02]"
                            >
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                                    {page.heroTitle.replace('Together', '')}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {page.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Moods Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                        Moods & Activities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {moods.map((page) => (
                            <Link
                                key={page.slug}
                                href={`/listen-together/${page.slug}`}
                                className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:scale-[1.02]"
                            >
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                                    {page.heroTitle.replace('Together', '')}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {page.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
