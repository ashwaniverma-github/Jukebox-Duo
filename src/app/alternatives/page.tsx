import { Metadata } from 'next';
import Link from 'next/link';
import { alternativePages } from '@/lib/seo-data';
import Footer from '@/components/Footer';
import { CONFIG } from '@/lib/config';

export const metadata: Metadata = {
    title: 'Top Music App Alternatives | Jukebox Duo',
    description: 'Looking for a better music experience? Browse ad-free alternatives to popular music streaming services with synchronized listening features.',
    alternates: {
        canonical: 'https://jukeboxduo.com/alternatives',
    },
};

export default function AlternativesHub() {
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
                        Better Music Alternatives
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Discover why music lovers are switching to Jukebox Duo for a more social, ad-free, and perfectly synchronized listening experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {alternativePages.map((page) => (
                        <Link
                            key={page.slug}
                            href={`/alternatives/${page.slug}`}
                            className="group relative p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:scale-[1.02] overflow-hidden"
                        >
                            {/* Accent Background */}
                            <div className={`absolute -right-20 -top-20 w-64 h-64 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none rounded-full ${page.slug === 'spotify' ? 'bg-green-500' : 'bg-red-500'
                                }`} />

                            <h3 className="text-2xl font-bold mb-4 group-hover:text-red-400 transition-colors relative z-10">
                                {page.slug === 'spotify' ? 'Spotify Alternative' : 'YouTube Music Alternative'}
                            </h3>
                            <p className="text-gray-400 mb-6 relative z-10">
                                {page.description}
                            </p>

                            <div className="flex items-center text-sm font-semibold text-red-500 group-hover:gap-2 transition-all">
                                Learn More
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Benefits Highlights */}
                <section className="mt-24 grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'Ad-Free Forever',
                            desc: 'No interruptions, just pure music for you and your friends.',
                            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        },
                        {
                            title: 'Perfect Sync',
                            desc: 'Experience music in perfect real-time synchronization across the globe.',
                            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        },
                        {
                            title: 'Cheap & Fair',
                            desc: 'Affordable lifetime access without recurring monthly subscriptions.',
                            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        }
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center">
                            <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center text-red-500 mx-auto mb-4">
                                {item.icon}
                            </div>
                            <h4 className="font-bold mb-2">{item.title}</h4>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                    ))}
                </section>
            </main>

            <Footer />
        </div>
    );
}
