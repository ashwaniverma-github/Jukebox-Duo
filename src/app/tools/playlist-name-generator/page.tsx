"use client"
import React, { useState } from 'react';
import { CONFIG } from '@/lib/config';
import { generatePlaylistNames, Vibe } from '@/lib/playlist-data';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PlaylistNameGenerator() {
    const [selectedVibe, setSelectedVibe] = useState<Vibe>('chill');
    const [generatedNames, setGeneratedNames] = useState<string[]>([]);
    const [hasGenerated, setHasGenerated] = useState(false);

    const vibes: { id: Vibe; label: string; icon: string; color: string }[] = [
        { id: 'chill', label: 'Chill', icon: '☁️', color: 'from-blue-500 to-cyan-400' },
        { id: 'sad', label: 'Sad', icon: '💔', color: 'from-gray-500 to-slate-400' },
        { id: 'hype', label: 'Hype', icon: '🔥', color: 'from-orange-500 to-red-500' },
        { id: 'party', label: 'Party', icon: '🎉', color: 'from-purple-500 to-pink-500' },
        { id: 'workout', label: 'Workout', icon: '💪', color: 'from-red-600 to-orange-600' },
        { id: 'love', label: 'Love', icon: '💘', color: 'from-pink-400 to-rose-400' },
        { id: 'focus', label: 'Focus', icon: '🧠', color: 'from-indigo-500 to-blue-500' },
        { id: 'travel', label: 'Travel', icon: '✈️', color: 'from-emerald-500 to-teal-500' },
    ];

    const handleGenerate = () => {
        const names = generatePlaylistNames(selectedVibe, 10);
        setGeneratedNames(names);
        setHasGenerated(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

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

                {/* Tool Interface */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl mb-20">
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">
                            Select your Vibe
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {vibes.map((vibe) => (
                                <button
                                    key={vibe.id}
                                    onClick={() => setSelectedVibe(vibe.id)}
                                    className={`
                                        relative group p-4 rounded-xl border transition-all duration-300 text-left
                                        ${selectedVibe === vibe.id
                                            ? 'bg-white/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                            : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}
                                    `}
                                >
                                    <div className="text-2xl mb-2">{vibe.icon}</div>
                                    <div className={`font-semibold ${selectedVibe === vibe.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                        {vibe.label}
                                    </div>
                                    {selectedVibe === vibe.id && (
                                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${vibe.color} opacity-10 pointer-events-none`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg hover:from-red-500 hover:to-red-400 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-red-900/20"
                    >
                        Generate Names
                    </button>

                    {/* Results */}
                    {hasGenerated && (
                        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-xl font-semibold mb-6 text-center text-gray-200">
                                Fresh names for your <span className="text-red-400">{vibes.find(v => v.id === selectedVibe)?.label}</span> playlist
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {generatedNames.map((name, index) => (
                                    <div
                                        key={index}
                                        className="group flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/20 transition-all hover:bg-white/5"
                                    >
                                        <span className="font-medium text-lg text-gray-200 group-hover:text-white pl-2">
                                            {name}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                copyToClipboard(name);
                                                const btn = e.currentTarget;
                                                const originalText = btn.innerText;
                                                btn.innerText = 'Copied!';
                                                setTimeout(() => btn.innerText = originalText, 1500);
                                            }}
                                            className="px-3 py-1 text-xs font-semibold text-gray-500 bg-white/5 rounded-md hover:bg-white/20 hover:text-white transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SEO Content Section */}
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

                    <h2 className="text-2xl font-bold mb-4">Why Use a Generator?</h2>
                    <p>
                        Sometimes creativity blocks strike when you just want to organize your music.
                        Instead of settling for &quot;My Playlist #45&quot;, use this tool to spark inspiration.
                        We combine thousands of aesthetic words, slang, and emotive terms to create unique titles you won&apos;t find elsewhere.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
