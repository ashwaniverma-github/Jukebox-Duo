'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Music, ListMusic, Users, Sparkles, X } from 'lucide-react';
import AdBanner from './AdBanner';

interface SEOContentProps {
    currentTheme: {
        buttonGradient: string;
        text: string;
    };
    onClose: () => void;
}

const SEOContent: React.FC<SEOContentProps> = ({ currentTheme, onClose }) => {
    return (
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 mt-20 border-t border-white/5 group/seo">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-500 transition-all duration-300 z-20 group"
                title="Hide this section"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* About Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-7 space-y-8"
                >
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic">
                            Jukebox <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.buttonGradient} pr-2`}>Duo</span>
                        </h2>
                        <div className={`w-20 h-1 bg-gradient-to-r ${currentTheme.buttonGradient} rounded-full`}></div>
                    </div>

                    <div className="space-y-6">
                        <p className={`text-lg leading-relaxed ${currentTheme.text} font-medium`}>
                            Experience music in perfect synchronization. Jukebox Duo bridges the gap between distance and connection,
                            allowing you to share your favorite sounds with friends, partners, and communities in real-time.
                        </p>
                        <p className={`text-base leading-relaxed ${currentTheme.text} opacity-70`}>
                            Whether it&apos;s a long-distance date night or a virtual study group, our proprietary sync engine ensures
                            that every participant hears exactly what you hear, when you hear it. No lag, no latency, just pure
                            shared vibing.
                        </p>
                    </div>

                    {/* Ad Placement 2 - Integrated into layout */}
                    <div className="mt-8 pt-8 border-t border-white/5 hidden lg:block">
                        <AdBanner slot="7429084095" className="!my-0" />
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-5 grid grid-cols-1 gap-4"
                >
                    {[
                        { title: "Real-Time Sync", desc: "Zero-latency playback across all connected devices.", icon: <Zap className="w-5 h-5 text-yellow-400" /> },
                        { title: "YouTube Magic", desc: "Access millions of tracks through seamless integration.", icon: <Music className="w-5 h-5 text-rose-400" /> },
                        { title: "Collaborative Queue", desc: "Everyone gets a say in the musical journey.", icon: <ListMusic className="w-5 h-5 text-blue-400" /> },
                        { title: "Live Presence", desc: "See who's vibing with you in real-time.", icon: <Users className="w-5 h-5 text-emerald-400" /> },
                        { title: "Premium Themes", desc: "Customized aesthetics for your listening mood.", icon: <Sparkles className="w-5 h-5 text-purple-400" /> }
                    ].map((feat, i) => (
                        <div key={i} className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all">
                                    {feat.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base">{feat.title}</h4>
                                    <p className={`text-xs ${currentTheme.text} opacity-60`}>{feat.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Mobile Ad Placement */}
                <div className="lg:hidden mt-8 w-full">
                    <AdBanner slot="7429084095" />
                </div>
            </div>
        </div>
    );
};

export default SEOContent;
