"use client"
import React, { useState } from 'react';
import { generatePlaylistNames, Vibe } from '@/lib/playlist-data';

export default function PlaylistGeneratorTool() {
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
    };

    return (
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
    );
}
