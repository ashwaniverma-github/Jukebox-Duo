import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Users, Zap, Shield, Globe, Music, Sparkles, Clock, CreditCard, Wifi, Volume2, PlayCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { CONFIG } from '@/lib/config';
import AnimatedSection from '@/components/AnimatedSection';

export const metadata: Metadata = {
    title: 'Best Spotify Jam Alternative (2026) — Free & Ad-Free | Jukebox Duo',
    description: 'Looking for a Spotify Jam alternative? Jukebox Duo lets you listen to music with friends in real-time - your friends join free, ad-free, and better sync. Try it free.',
    keywords: [
        'spotify jam alternative',
        'spotify jam alternatives',
        'spotify jam not working',
        'spotify group session alternative',
        'listen to music together',
        'listen with friends online',
        'spotify jam replacement',
        'spotify jam free alternative',
        'group listening app',
        'music listening party app',
        'listen together app',
        'spotify jam lag fix',
    ],
    openGraph: {
        title: 'Best Spotify Jam Alternative (2026) — Free & Ad-Free | Jukebox Duo',
        description: 'Listen to music with friends in real-time. Your friends join free, ad-free, better sync than Spotify Jam.',
        url: 'https://jukeboxduo.com/spotify-jam-alternative',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Best Spotify Jam Alternative — Jukebox Duo',
        description: 'Free group listening rooms with better sync than Spotify Jam. Your friends join completely free.',
    },
    alternates: {
        canonical: 'https://jukeboxduo.com/spotify-jam-alternative',
    },
};

const faqs = [
    {
        q: 'What is the best Spotify Jam alternative in 2026?',
        a: 'Jukebox Duo is the best Spotify Jam alternative. It offers free, ad-free group listening rooms with better synchronization. Your friends can join completely free without needing any subscription.',
    },
    {
        q: 'Why is Spotify Jam not working for me?',
        a: 'Spotify Jam commonly has issues with sync drift, connection drops, and the requirement that ALL participants need a Spotify Premium subscription. Jukebox Duo solves all of these — your friends join free with no subscription required.',
    },
    {
        q: 'Do my friends need to pay to use Jukebox Duo?',
        a: 'No! Your friends can join your listening room completely free — no subscription fees, no ads. Just share a link and they\'re in.',
    },
    {
        q: 'How many people can listen together on Jukebox Duo?',
        a: 'Jukebox Duo supports group listening rooms without the 32-person cap that Spotify Jam has. Whether it\'s a couple or a large friend group, everyone stays perfectly synced.',
    },
    {
        q: 'Is Jukebox Duo free to use?',
        a: 'Yes! Jukebox Duo offers a free tier and an affordable lifetime deal. Unlike Spotify Jam which requires monthly Premium subscriptions for every participant, your friends join Jukebox Duo rooms completely free.',
    },
    {
        q: 'Can I import my Spotify playlists to Jukebox Duo?',
        a: 'You can search and add any song from our extensive library. We support YouTube Music playlist imports, so you can move your music over quickly and enjoy it ad-free with friends.',
    },
    {
        q: 'How does Jukebox Duo sync compare to Spotify Jam?',
        a: 'Jukebox Duo uses a dedicated low-latency sync engine built specifically for group listening. Unlike Spotify Jam which often drifts out of sync, Jukebox Duo ensures everyone hears the exact same millisecond of the track.',
    },
    {
        q: 'Does Jukebox Duo work in the browser?',
        a: 'Yes! Jukebox Duo runs entirely in your web browser — no app downloads, no extensions. Just open the link and start listening. It\'s optimized for both desktop and mobile browsers.',
    },
];

export default function SpotifyJamAlternativePage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30 font-[var(--font-inter)]">
            {/* FAQ + Article Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqs.map((faq) => ({
                            "@type": "Question",
                            "name": faq.q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": faq.a,
                            },
                        })),
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": "Best Spotify Jam Alternative in 2026",
                        "description": "A comprehensive comparison of Spotify Jam alternatives for group music listening, including Jukebox Duo, Juky, GroupTube, and VibeSync.",
                        "author": {
                            "@type": "Organization",
                            "name": "Jukebox Duo",
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Jukebox Duo",
                            "url": "https://jukeboxduo.com",
                        },
                        "datePublished": "2026-03-04",
                        "dateModified": "2026-03-04",
                        "url": "https://jukeboxduo.com/spotify-jam-alternative",
                    }),
                }}
            />

            {/* Ambient Background - Enhanced */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] rounded-full animate-pulse opacity-70" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full opacity-50" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Navbar */}
            <nav className={`fixed ${CONFIG.MAINTENANCE_MODE ? 'top-10' : 'top-0'} left-0 w-full flex items-center justify-between px-6 py-4 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5`}>
                <Link href="/" className="font-bold text-xl tracking-tight text-white group">
                    Jukebox<span className="text-red-500 group-hover:animate-pulse transition-all ml-1">Duo</span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</Link>
                    <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">About</Link>
                    <Link href="/alternatives" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Alternatives</Link>
                </div>
                <Link href="/signin" className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform">
                    Try Free
                </Link>
            </nav>

            <main className="relative pt-32 pb-24">
                {/* ============================================ */}
                {/* HERO SECTION */}
                {/* ============================================ */}
                <section className="container mx-auto px-4 max-w-5xl text-center mb-32 relative z-10">
                    <AnimatedSection delay={0.1}>
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-2xl hover:bg-white/10 transition-colors cursor-default">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-bold tracking-widest uppercase text-green-400 drop-shadow-md">Spotify Jam Alternative</span>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={0.2}>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 leading-[1.1] drop-shadow-sm">
                            The Best Spotify Jam<br />Alternative in 2026
                        </h1>
                    </AnimatedSection>

                    <AnimatedSection delay={0.3}>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Spotify Jam requires <strong className="text-white">Premium for everyone</strong>, has sync drift, and caps at 32 people.
                            Jukebox Duo fixes all of that — <strong className="text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]">your friends join completely free</strong>.
                        </p>
                    </AnimatedSection>

                    <AnimatedSection delay={0.4}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 mt-4">
                            <Link href="/signin" className="group relative px-10 py-5 bg-gradient-to-b from-red-500 to-red-700 text-white rounded-2xl font-bold text-lg hover:from-red-400 hover:to-red-600 transition-all shadow-[0_0_40px_-10px_rgba(220,38,38,0.6)] hover:shadow-[0_0_60px_-10px_rgba(220,38,38,0.8)] flex items-center gap-3 hover:-translate-y-1">
                                Try Jukebox Duo Free
                                <Sparkles className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
                            </Link>
                            <Link href="#comparison" className="group px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 backdrop-blur-sm hover:-translate-y-1">
                                See Comparison
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <p className="text-gray-500 text-sm font-medium flex items-center justify-center gap-2">
                            <Check className="w-4 h-4 text-green-500" /> Ad-free forever
                            <span className="mx-2 opacity-30">•</span>
                            <Users className="w-4 h-4 text-blue-400" /> Your friends join free
                        </p>
                    </AnimatedSection>
                </section>

                {/* ============================================ */}
                {/* WHAT'S WRONG WITH SPOTIFY JAM? */}
                {/* ============================================ */}
                <AnimatedSection delay={0.2} className="container mx-auto px-4 max-w-5xl mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 inline-block relative">
                            What&apos;s Wrong with Spotify Jam?
                            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                        </h2>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto mt-6">
                            Spotify Jam was a promising idea, but the execution leaves a lot to be desired.
                            Here&apos;s why thousands of users are looking for alternatives.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <CreditCard className="w-6 h-6" />,
                                title: 'Premium Required for ALL',
                                desc: 'Every person in a Spotify Jam session needs their own Premium subscription. That\'s $11.99/month per friend just to listen together.',
                            },
                            {
                                icon: <Wifi className="w-6 h-6" />,
                                title: 'Constant Sync Drift',
                                desc: 'Spotify Jam frequently falls out of sync, meaning you hear the chorus while your friend is still on the verse. The "listen together" experience breaks constantly.',
                            },
                            {
                                icon: <Users className="w-6 h-6" />,
                                title: 'Capped at 32 People',
                                desc: 'Hosting a larger listening party? Too bad. Spotify Jam maxes out at 32 participants, making it useless for bigger groups or events.',
                            },
                            {
                                icon: <Volume2 className="w-6 h-6" />,
                                title: 'Ad Interruptions',
                                desc: 'If any participant is on the free tier, they get blasted with ads that completely break the shared listening experience for that person.',
                            },
                            {
                                icon: <Globe className="w-6 h-6" />,
                                title: 'Proximity Limits',
                                desc: 'Starting a Jam session originally required being near each other. While remote Jams now exist, the feature still feels like an afterthought.',
                            },
                            {
                                icon: <Clock className="w-6 h-6" />,
                                title: 'No Persistent Rooms',
                                desc: 'Spotify Jam sessions are temporary. Once everyone leaves, it\'s gone. There\'s no way to keep a room open for recurring listening sessions.',
                            },
                        ].map((issue, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-red-500/50 hover:bg-red-500/[0.02] transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full group-hover:bg-red-500/20 transition-colors" />
                                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                    {issue.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-100 transition-colors relative z-10">{issue.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-medium relative z-10">{issue.desc}</p>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>

                {/* ============================================ */}
                {/* COMPARISON TABLE */}
                {/* ============================================ */}
                <AnimatedSection delay={0.1} id="comparison" className="container mx-auto px-4 max-w-5xl mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 inline-block relative">
                            Spotify Jam vs Jukebox Duo
                            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                        </h2>
                        <p className="text-gray-400 text-xl mt-6">
                            A side-by-side comparison of the features that matter most.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/40">
                                    <th className="p-6 md:p-8 text-gray-400 font-bold text-sm uppercase tracking-widest w-1/3">Feature</th>
                                    <th className="p-6 md:p-8 text-white/50 font-bold text-sm uppercase tracking-widest w-1/3 border-l border-white/5">Spotify Jam</th>
                                    <th className="p-6 md:p-8 text-red-400 font-bold text-sm uppercase tracking-widest w-1/3 border-l border-white/5 bg-red-500/[0.02]">Jukebox Duo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Friend access', jam: 'All need Premium ($11.99/mo)', duo: 'Friends join completely free', jamBad: true },
                                    { feature: 'Sync quality', jam: 'Frequent drift & desync', duo: 'Ultra-low latency sync engine', jamBad: true },
                                    { feature: 'Max participants', jam: '32 people limit', duo: 'No hard cap', jamBad: true },
                                    { feature: 'Ads', jam: 'Ads for free-tier users', duo: 'Always ad-free for everyone', jamBad: true },
                                    { feature: 'Platform', jam: 'Spotify app only', duo: 'Any web browser — no downloads', jamBad: true },
                                    { feature: 'Persistent rooms', jam: 'No — sessions are temporary', duo: 'Yes — rooms stay open', jamBad: true },
                                    { feature: 'Collaborative queue', jam: 'Basic', duo: 'Full queue management', jamBad: false },
                                    { feature: 'Music library', jam: 'Spotify catalog', duo: 'YouTube / YouTube Music catalog', jamBad: false },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group">
                                        <td className="p-6 md:p-8 font-semibold text-white/90 group-hover:text-white transition-colors">{row.feature}</td>
                                        <td className="p-6 md:p-8 border-l border-white/5">
                                            <div className="flex items-start gap-3">
                                                {row.jamBad ? (
                                                    <div className="mt-0.5 p-1 rounded-full bg-red-500/10 flex-shrink-0">
                                                        <X className="w-4 h-4 text-red-500" />
                                                    </div>
                                                ) : (
                                                    <div className="mt-0.5 p-1 rounded-full bg-gray-500/10 flex-shrink-0">
                                                        <Check className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                )}
                                                <span className={`${row.jamBad ? 'text-gray-500 font-medium' : 'text-gray-400'}`}>{row.jam}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 md:p-8 border-l border-white/5 bg-red-500/[0.02]">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 p-1 rounded-full bg-green-500/10 flex-shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                </div>
                                                <span className="text-white font-bold tracking-tight">{row.duo}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AnimatedSection>

                {/* ============================================ */}
                {/* WHY JUKEBOX DUO IS THE BEST ALTERNATIVE */}
                {/* ============================================ */}
                <AnimatedSection delay={0.2} className="container mx-auto px-4 max-w-5xl mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 inline-block relative">
                            Why Jukebox Duo is the #1 Alternative
                            <div className="absolute -bottom-2 right-0 w-2/3 h-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
                        </h2>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto mt-6">
                            Built from the ground up for group listening — not bolted on as an afterthought.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users className="w-7 h-7" />,
                                title: 'Friends Join Free',
                                desc: 'Share a link and your friends are in — no subscriptions, no friction. Everyone listens together for free.',
                            },
                            {
                                icon: <Zap className="w-7 h-7" />,
                                title: 'Perfect Sync Engine',
                                desc: 'Our proprietary sync engine ensures everyone hears the exact same millisecond of every track. Zero drift, zero delay.',
                            },
                            {
                                icon: <Shield className="w-7 h-7" />,
                                title: 'Always Ad-Free',
                                desc: 'No ads ever — not for you, not for your friends. Music should never be interrupted by advertisements.',
                            },
                            {
                                icon: <Globe className="w-7 h-7" />,
                                title: 'Works in Any Browser',
                                desc: 'No app downloads, no extensions. Open a link in Chrome, Safari, or Edge and start listening immediately.',
                            },
                            {
                                icon: <Music className="w-7 h-7" />,
                                title: 'Collaborative Queue',
                                desc: 'Everyone in the room can add songs, vote on tracks, and control playback. It\'s democratic listening.',
                            },
                            {
                                icon: <Clock className="w-7 h-7" />,
                                title: 'Persistent Rooms',
                                desc: 'Your room stays open. Come back tomorrow, next week, or whenever — your queue and settings are waiting.',
                            },
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-red-500/40 transition-all hover:-translate-y-2 group shadow-xl">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/5 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>

                {/* ============================================ */}
                {/* HOW JUKEBOX DUO COMPARES TO OTHER ALTERNATIVES */}
                {/* ============================================ */}
                <section className="container mx-auto px-4 max-w-4xl mb-32">
                    <div className="prose prose-invert prose-p:text-gray-400 prose-headings:text-white max-w-none bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8">
                            How Jukebox Duo Compares to Other Spotify Jam Alternatives
                        </h2>

                        <p className="text-lg leading-relaxed mb-8">
                            There are several apps positioning themselves as Spotify Jam replacements. Here&apos;s how the major alternatives stack up against each other — and why we believe Jukebox Duo offers the best experience.
                        </p>

                        <div className="space-y-10 not-prose">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-3">Jukebox Duo vs Juky</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    <strong className="text-white">Juky</strong> is a Spotify-dependent Jam alternative that uses the Spotify API for playback.
                                    While it adds voting features, it still requires the host to have Spotify Premium and plays through the host&apos;s device only.
                                    <strong className="text-red-400"> Jukebox Duo</strong> runs independently in everyone&apos;s browser with true individual playback and sync — each person has their own volume control, and the experience isn&apos;t tied to one device.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-3">Jukebox Duo vs GroupTube</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    <strong className="text-white">GroupTube</strong> focuses on synchronized video/music playback across platforms.
                                    It&apos;s a solid option for casual groups, but lacks persistent rooms and a polished music-first interface.
                                    <strong className="text-red-400"> Jukebox Duo</strong> is purpose-built for music listening with a premium interface, persistent rooms, collaborative queues, and an ad-free guarantee.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-3">Jukebox Duo vs Discord Bots</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Many people use <strong className="text-white">Discord music bots</strong> (like Jockie Music or Hydra) as a workaround for group listening.
                                    However, these bots frequently go down, have poor audio quality, and require everyone to be in a Discord server.
                                    <strong className="text-red-400"> Jukebox Duo</strong> is a dedicated web app with professional-grade audio and sync — no Discord required, no bot setup, just a shareable link.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* HOW TO SWITCH FROM SPOTIFY JAM */}
                {/* ============================================ */}
                <AnimatedSection delay={0.2} className="container mx-auto px-4 max-w-4xl mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 inline-block relative">
                            How to Switch from Spotify Jam
                            <div className="absolute -bottom-2 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
                        </h2>
                        <p className="text-gray-400 text-xl mt-6">
                            It takes less than 30 seconds. No downloads, no setup.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting line for desktop */}
                        <div className="hidden md:block absolute top-[4.5rem] left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>

                        {[
                            {
                                step: '01',
                                title: 'Create Your Room',
                                desc: 'Sign up free and create your first listening room. It takes about 10 seconds.',
                                icon: <PlayCircle className="w-8 h-8 text-red-400" />
                            },
                            {
                                step: '02',
                                title: 'Share the Link',
                                desc: 'Copy your room link and send it to friends via WhatsApp, iMessage, Discord — anywhere.',
                                icon: <Globe className="w-8 h-8 text-blue-400" />
                            },
                            {
                                step: '03',
                                title: 'Queue & Listen',
                                desc: 'Search for songs, build your queue together, and hit play. Everyone hears the same track at the same time.',
                                icon: <Music className="w-8 h-8 text-green-400" />
                            },
                        ].map((step, i) => (
                            <div key={i} className="relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 pt-16 group hover:border-white/20 transition-all z-10 backdrop-blur-md">
                                <span className="text-7xl font-black text-white/5 absolute top-2 right-6 group-hover:text-white/10 transition-colors">{step.step}</span>
                                <div className="absolute -top-6 left-8 w-14 h-14 rounded-full bg-black border-2 border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform group-hover:border-white/40">
                                    {step.icon}
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-4 mt-2">{step.title}</h3>
                                    <p className="text-gray-400 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>

                {/* ============================================ */}
                {/* DEEP DIVE SEO CONTENT */}
                {/* ============================================ */}
                <section className="container mx-auto px-4 max-w-4xl mb-32">
                    <div className="prose prose-invert prose-p:text-gray-400 prose-headings:text-white max-w-none bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8">
                            Why People Are Leaving Spotify Jam for Jukebox Duo
                        </h2>

                        <p className="text-lg leading-relaxed mb-8">
                            Spotify Jam (formerly Group Session) launched with great promise: listen to music together with friends in real-time.
                            But the reality hasn&apos;t lived up to the hype. Users consistently report sync issues, frustration with Premium requirements,
                            and a general sense that the feature was bolted onto Spotify as an afterthought rather than designed from the ground up.
                        </p>

                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-red-500">01.</span> The Premium Tax Problem
                        </h3>
                        <p className="text-lg">
                            The biggest complaint about Spotify Jam is that <strong>every single participant needs a Spotify Premium subscription</strong> ($11.99/month).
                            Want to listen with 5 friends? That&apos;s $60/month in combined subscriptions just for one feature.
                            With Jukebox Duo, <strong>your friends join completely free</strong>.
                            No payment walls, no subscription fees. Just share a link.
                        </p>

                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-red-500">02.</span> Built for Sync, Not Bolted On
                        </h3>
                        <p className="text-lg">
                            Spotify Jam was added to an app primarily designed for solo listening. The sync engine is not optimized for real-time group playback,
                            which is why users experience drift — you hear the beat drop while your friend is still hearing the buildup.
                            Jukebox Duo was <strong>built from day one for synchronized listening</strong>. Our custom sync engine uses low-latency WebSocket
                            protocols to keep every participant on the exact same millisecond of playback.
                        </p>

                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-red-500">03.</span> No Downloads, No Friction
                        </h3>
                        <p className="text-lg">
                            Spotify Jam requires everyone to have the Spotify app installed on their device.
                            Jukebox Duo runs entirely in the browser — on desktop, tablet, or mobile.
                            When you share a room link, your friend can click it and be listening within seconds.
                            No app store visits, no waiting for downloads.
                        </p>

                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-red-500">04.</span> A Lifetime Deal vs. Monthly Rent
                        </h3>
                        <p className="text-lg">
                            Spotify charges $11.99/month forever. Cancel, and you lose everything.
                            Jukebox Duo offers an <strong>affordable one-time lifetime deal</strong> — pay once and enjoy premium features forever.
                            No recurring charges, no surprise price hikes, no subscription fatigue.
                        </p>
                    </div>
                </section>

                {/* ============================================ */}
                {/* FAQ SECTION */}
                {/* ============================================ */}
                <section className="container mx-auto px-4 max-w-4xl mb-32">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                        Frequently Asked Questions About Spotify Jam Alternatives
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                                <summary className="flex items-center justify-between font-bold text-lg list-none">
                                    {faq.q}
                                    <Check className="w-5 h-5 text-red-500 group-open:rotate-45 transition-transform flex-shrink-0 ml-4" />
                                </summary>
                                <p className="mt-4 text-gray-500 leading-relaxed font-medium border-l-2 border-red-500 ml-2 pl-4">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* ============================================ */}
                {/* FINAL CTA */}
                {/* ============================================ */}
                <AnimatedSection delay={0.2} className="container mx-auto px-4 max-w-5xl">
                    <div className="relative p-12 md:p-24 rounded-[3.5rem] bg-gradient-to-br from-red-600 via-red-700 to-red-900 overflow-hidden text-center group shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay" />
                        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/20 blur-[100px] rounded-full animate-pulse opacity-70" />
                        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-black/60 blur-[100px] rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-red-900/50 to-transparent" />

                        <div className="relative z-10">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight drop-shadow-md">
                                Ready to Ditch<br className="hidden md:block" /> Spotify Jam?
                            </h2>
                            <p className="text-2xl text-red-100/90 mb-12 max-w-2xl mx-auto font-medium drop-shadow-sm">
                                Create your first room in 10 seconds. Your friends join completely free.
                            </p>
                            <Link href="/signin" className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black rounded-full font-black text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)]">
                                Start Listening Free
                                <Sparkles className="w-6 h-6 text-red-600" />
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>
            </main>

            <Footer />
        </div>
    );
}
