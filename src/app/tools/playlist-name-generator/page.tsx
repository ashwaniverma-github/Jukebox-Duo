import { Metadata } from 'next';
import Link from 'next/link';
import { CONFIG } from '@/lib/config';
import Footer from '@/components/Footer';
import PlaylistGeneratorTool from '@/components/PlaylistGeneratorTool';

export const metadata: Metadata = {
    title: 'Playlist Name Generator - Free Aesthetic Playlist Names | Jukebox Duo',
    description: 'Generate aesthetic, mood-based playlist names for Spotify, Apple Music, or YouTube Music. Choose your vibe and get unique, creative playlist title ideas instantly — completely free.',
    keywords: [
        'playlist name generator',
        'playlist names generator',
        'playlist title generator',
        'playlist names ai',
        'aesthetic playlist names',
        'spotify playlist names',
        'creative playlist names',
        'playlist name ideas',
        'cool playlist names',
        'funny playlist names',
    ],
    alternates: {
        canonical: 'https://jukeboxduo.com/tools/playlist-name-generator',
    },
    openGraph: {
        title: 'Playlist Name Generator - Free Aesthetic Playlist Names',
        description: 'Generate aesthetic, mood-based playlist names for Spotify, Apple Music, or YouTube Music. Free tool by Jukebox Duo.',
        url: 'https://jukeboxduo.com/tools/playlist-name-generator',
        type: 'website',
    },
};

export default function PlaylistNameGenerator() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-red-500/30 font-sans">
            {/* Background Gradient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-40" />
            </div>

            {/* Navbar */}
            <nav className={`fixed ${CONFIG.MAINTENANCE_MODE ? 'top-10' : 'top-0'} left-0 w-full flex items-center justify-between px-6 py-4 z-50 backdrop-blur-md bg-black/20 border-b border-white/5`}>
                <Link href="/" className="font-bold text-xl tracking-tight text-white hover:opacity-80 transition-opacity">
                    Jukebox<span className="text-red-500">Duo</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/listen-together"
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden md:block"
                    >
                        Listen Together
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-20 px-4 container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-xs font-semibold tracking-wider text-red-400 mb-4 border border-white/10">
                        FREE TOOL
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                        Playlist Name Generator
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Stuck on a name? Generate aesthetic, mood-based titles for your Spotify or Apple Music playlists instantly.
                    </p>
                </div>

                {/* Interactive Tool (Client Component) */}
                <PlaylistGeneratorTool />

                {/* SEO Content Section - Server Rendered */}
                <div className="prose prose-invert max-w-none prose-headings:text-gray-100 prose-p:text-gray-400 prose-a:text-red-400 hover:prose-a:text-red-300">
                    <h2 className="text-3xl font-bold mb-6">How to Choose the Perfect Playlist Name</h2>
                    <p className="mb-6">
                        A great playlist name isn&apos;t just about describing the genre—it&apos;s about capturing a feeling.
                        Whether you&apos;re curating tracks for a late-night drive or a high-intensity workout, the title sets the stage.
                        Our <strong>aesthetic playlist name generator</strong> helps you find that perfect mix of mood and mystery.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 my-12 not-prose">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3">🎨 Match the Vibe</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Don&apos;t name a sad playlist &quot;Sad Songs.&quot; Go for something evocative like &quot;Midnight Rain&quot; or &quot;Echoes of You.&quot;
                                Use abstract nouns and atmospheric adjectives.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3">✨ Use Emojis (Wisely)</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                One or two well-placed emojis can make your playlist stand out in a crowded library.
                                Our generator automatically suggests matching emojis for each vibe.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">Why Use a Playlist Name Generator?</h2>
                    <p>
                        Sometimes creativity blocks strike when you just want to organize your music.
                        Instead of settling for &quot;My Playlist #45&quot;, use this tool to spark inspiration.
                        We combine thousands of aesthetic words, slang, and emotive terms to create unique titles you won&apos;t find elsewhere.
                    </p>

                    <h2 className="text-2xl font-bold mb-4 mt-12">Playlist Name Ideas by Category</h2>
                    <p>
                        Looking for specific types of playlist names? Here are some popular categories our generator covers:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li><strong>Chill playlist names</strong> — Perfect for lo-fi beats, ambient music, and relaxation playlists</li>
                        <li><strong>Workout playlist names</strong> — High-energy titles for gym sessions and running playlists</li>
                        <li><strong>Sad playlist names</strong> — Aesthetic, moody titles for when you&apos;re in your feelings</li>
                        <li><strong>Party playlist names</strong> — Fun, upbeat names for house parties and celebrations</li>
                        <li><strong>Focus playlist names</strong> — Clean, minimal names for study and deep work sessions</li>
                        <li><strong>Love playlist names</strong> — Romantic and heartfelt titles for couple playlists</li>
                        <li><strong>Travel playlist names</strong> — Adventure-inspired names for road trips and exploring</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-4 mt-12">Works With All Music Platforms</h2>
                    <p>
                        Our playlist name generator creates titles that work perfectly on <strong>Spotify</strong>, <strong>Apple Music</strong>,
                        <strong> YouTube Music</strong>, <strong>Amazon Music</strong>, and any other streaming platform.
                        Simply generate names, copy your favorites, and paste them directly into your playlist.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
