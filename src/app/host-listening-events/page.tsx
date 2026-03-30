import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Users, Zap, Shield, Globe, Music, Sparkles, Clock, Radio, Headphones, Share2, Lock, Volume2, PlayCircle, Crown, Monitor } from 'lucide-react';
import Footer from '@/components/Footer';
import { CONFIG } from '@/lib/config';
import AnimatedSection from '@/components/AnimatedSection';
import { safeJsonLd } from '@/lib/safe-json-ld';

export const metadata: Metadata = {
    title: 'Host a Listening Party Online (2026) — Guests Join Free | Jukebox Duo',
    description: 'Host virtual listening parties, album releases, DJ sets & silent discos for 100+ listeners. Guests join free via link — no app, no login. Start in 10 seconds.',
    keywords: [
        'host listening party online',
        'listening party platform',
        'host music event online',
        'virtual listening party',
        'silent disco app',
        'dj listening party',
        'album release listening party',
        'online listening event',
        'stream music to audience',
        'collective listening experience',
        'how to host a virtual listening party',
        'best app to host listening party',
        'free listening party platform',
        'dj event hosting app no download',
    ],
    openGraph: {
        title: 'Host a Listening Party Online (2026) — Guests Join Free | Jukebox Duo',
        description: 'Host virtual listening parties for 100+ listeners. Guests join free via link — no app, no login, no subscription needed.',
        url: 'https://jukeboxduo.com/host-listening-events',
        type: 'website',
        images: [
            {
                url: 'https://jukeboxduo.com/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Jukebox Duo — Host Music Events Online',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Host a Listening Party Online (2026) — Guests Join Free | Jukebox Duo',
        description: 'Host virtual listening parties for 100+ listeners. Guests join free — no app, no login required.',
        images: ['https://jukeboxduo.com/og-image.png'],
    },
    alternates: {
        canonical: 'https://jukeboxduo.com/host-listening-events',
    },
};

const faqs = [
    {
        q: 'How do I host a virtual listening party online?',
        a: 'With Jukebox Duo, you subscribe to Event Pro ($9.99/mo), create an event room from your dashboard, and share the generated link with your audience. Guests click the link and are instantly synced to your playback — no app download, no login, no subscription required.',
    },
    {
        q: 'Do my guests need to pay or sign up to join?',
        a: 'No. Guests join completely free by clicking your event link. They don\'t need an account, a subscription, or an app download. They listen directly in their browser.',
    },
    {
        q: 'How many people can join my listening party?',
        a: 'Jukebox Duo supports 100+ simultaneous listeners per event room. This is far beyond Spotify Jam\'s 32-person cap or Amazon Music\'s 10-person limit.',
    },
    {
        q: 'Can guests control the music during my event?',
        a: 'No. In event mode, only the host controls playback. Guests are read-only synced listeners. This gives you full DJ-level control over the experience — no one can skip your tracks or disrupt the queue.',
    },
    {
        q: 'What is Event Pro and how much does it cost?',
        a: 'Event Pro is Jukebox Duo\'s hosting subscription at $9.99 per month. It unlocks event room creation, shareable event links with unique tokens, host-only playback control, and support for 100+ listeners. All premium features are included. Cancel anytime.',
    },
    {
        q: 'Does Jukebox Duo work on mobile devices?',
        a: 'Yes. Jukebox Duo runs in any modern web browser — desktop and mobile. On iOS, audio playback is automatically unlocked so guests don\'t need to tap extra buttons to start listening.',
    },
    {
        q: 'Can I use Jukebox Duo as a silent disco app?',
        a: 'Absolutely. Every guest\'s phone becomes a receiver. Stream the same music to everyone\'s headphones over the internet — no specialized hardware, no WiFi proximity requirements. It works from anywhere in the world.',
    },
    {
        q: 'How does Jukebox Duo compare to Spotify Jam for events?',
        a: 'Spotify Jam requires every listener to have Spotify Premium, caps at 32 people, and gives shared control to all participants. Jukebox Duo lets guests join free, supports 100+ listeners, and gives the host full control over playback — making it purpose-built for events.',
    },
];

export default function HostListeningEventsPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30 font-[var(--font-inter)]">
            {/* FAQ Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeJsonLd({
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
            {/* Article Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeJsonLd({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": "How to Host a Listening Party Online in 2026",
                        "description": "A comprehensive guide to hosting virtual listening parties, album release events, DJ sets, and silent discos online using Jukebox Duo.",
                        "author": {
                            "@type": "Organization",
                            "name": "Jukebox Duo",
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Jukebox Duo",
                            "url": "https://jukeboxduo.com",
                        },
                        "datePublished": "2026-03-30",
                        "dateModified": "2026-03-30",
                        "url": "https://jukeboxduo.com/host-listening-events",
                    }),
                }}
            />
            {/* BreadcrumbList Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: safeJsonLd({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://jukeboxduo.com",
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Host Listening Events",
                                "item": "https://jukeboxduo.com/host-listening-events",
                            },
                        ],
                    }),
                }}
            />

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] rounded-full animate-pulse opacity-70" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full opacity-50" />
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
                    <Link href="/host-listening-events" className="text-sm font-medium text-white transition-colors">Host Events</Link>
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
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                            </span>
                            <span className="text-sm font-bold tracking-widest uppercase text-purple-400 drop-shadow-md">Listening Party Platform</span>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={0.2}>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 leading-[1.1] drop-shadow-sm">
                            Host a Listening<br />Party Online
                        </h1>
                    </AnimatedSection>

                    <AnimatedSection delay={0.3}>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Stream music to <strong className="text-white">100+ listeners</strong> in real time.
                            Guests join free via a single link — <strong className="text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]">no app, no login, no subscription</strong>.
                            You control everything.
                        </p>
                    </AnimatedSection>

                    <AnimatedSection delay={0.4}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 mt-4">
                            <Link href="/signin" className="group relative px-10 py-5 bg-gradient-to-b from-red-500 to-red-700 text-white rounded-2xl font-bold text-lg hover:from-red-400 hover:to-red-600 transition-all shadow-[0_0_40px_-10px_rgba(220,38,38,0.6)] hover:shadow-[0_0_60px_-10px_rgba(220,38,38,0.8)] flex items-center gap-3 hover:-translate-y-1">
                                Host Your First Event
                                <Sparkles className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
                            </Link>
                            <Link href="#how-it-works" className="group px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 backdrop-blur-sm hover:-translate-y-1">
                                See How It Works
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <p className="text-gray-500 text-sm font-medium flex items-center justify-center gap-2">
                            <Check className="w-4 h-4 text-green-500" /> Guests join free
                            <span className="mx-2 opacity-30">&bull;</span>
                            <Users className="w-4 h-4 text-blue-400" /> 100+ listeners
                            <span className="mx-2 opacity-30">&bull;</span>
                            <Globe className="w-4 h-4 text-purple-400" /> No app download
                        </p>
                    </AnimatedSection>
                </section>

                {/* ============================================ */}
                {/* WHO IS THIS FOR */}
                {/* ============================================ */}
                <AnimatedSection delay={0.2} className="container mx-auto px-4 max-w-5xl mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 inline-block relative">
                            Built for Every Kind of Music Event
                            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                        </h2>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto mt-6">
                            Whether you&apos;re a DJ, an artist, or just someone who loves sharing music — Jukebox Duo is your stage.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Music className="w-6 h-6" />,
                                title: 'Album Release Parties',
                                desc: 'Drop your new album and listen through it with fans in real time. Build hype and community around every release.',
                            },
                            {
                                icon: <Radio className="w-6 h-6" />,
                                title: 'DJ Sets & Live Mixes',
                                desc: 'Stream your DJ set to an online audience. Full host control means you manage the vibe, not the crowd.',
                            },
                            {
                                icon: <Headphones className="w-6 h-6" />,
                                title: 'Silent Discos',
                                desc: 'Run a digital silent disco without any extra hardware. Every phone becomes a synced receiver — no WiFi proximity needed.',
                            },
                            {
                                icon: <Users className="w-6 h-6" />,
                                title: 'Corporate Team Building',
                                desc: 'Bond with your team over a shared playlist. Perfect for remote teams, virtual offsites, and company culture events.',
                            },
                            {
                                icon: <Sparkles className="w-6 h-6" />,
                                title: 'Fan Listening Parties',
                                desc: 'Artists: connect with your fans by hosting a listening session for your catalog, new singles, or unreleased previews.',
                            },
                            {
                                icon: <PlayCircle className="w-6 h-6" />,
                                title: 'Watch Parties & Premieres',
                                desc: 'Sync up for music video premieres or live stream listening events with your entire community.',
                            },
                        ].map((useCase, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/[0.02] transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                    {useCase.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-100 transition-colors relative z-10">{useCase.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-medium relative z-10">{useCase.desc}</p>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>

                {/* ============================================ */}
                {/* PAIN POINTS */}
                {/* ============================================ */}
                <AnimatedSection delay={0.2} className="container mx-auto px-4 max-w-5xl mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 inline-block relative">
                            Why Existing Platforms Fall Short for Events
                            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                        </h2>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto mt-6">
                            Most music sharing tools were built for casual hangouts, not real events.
                            Here&apos;s why hosts and DJs need something better.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Lock className="w-6 h-6" />,
                                title: 'Everyone Needs a Subscription',
                                desc: 'Spotify Jam, Amazon Music Party, and Apple SharePlay all require every listener to have a paid subscription. That\'s a non-starter for public events.',
                            },
                            {
                                icon: <Users className="w-6 h-6" />,
                                title: 'Tiny Listener Caps',
                                desc: 'Spotify Jam caps at 32 people. Amazon Music at 10. You can\'t host a real event with those limits.',
                            },
                            {
                                icon: <Shield className="w-6 h-6" />,
                                title: 'No Host-Only Control',
                                desc: 'Most platforms let anyone skip, pause, or add songs. That\'s collaborative, not an event. You need DJ-level control.',
                            },
                            {
                                icon: <Monitor className="w-6 h-6" />,
                                title: 'App Download Required',
                                desc: 'Asking 100 guests to download an app before they can listen kills attendance. Friction is the enemy of events.',
                            },
                            {
                                icon: <Crown className="w-6 h-6" />,
                                title: 'Login Walls Everywhere',
                                desc: 'Requiring guests to create accounts, sign in, or link streaming services adds friction that tanks your turnout.',
                            },
                            {
                                icon: <Volume2 className="w-6 h-6" />,
                                title: 'Poor Sync at Scale',
                                desc: 'Consumer-grade sync (Spotify, Discord bots) drifts noticeably with more than a handful of listeners. Events need precision.',
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
                            How Jukebox Duo Compares for Event Hosting
                            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                        </h2>
                        <p className="text-gray-400 text-xl mt-6">
                            A side-by-side look at what matters most for hosting music events.
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/40">
                                    <th className="p-6 md:p-8 text-gray-400 font-bold text-sm uppercase tracking-widest w-1/4">Feature</th>
                                    <th className="p-6 md:p-8 text-white/50 font-bold text-sm uppercase tracking-widest w-1/4 border-l border-white/5">Spotify Jam</th>
                                    <th className="p-6 md:p-8 text-white/50 font-bold text-sm uppercase tracking-widest w-1/4 border-l border-white/5">ListeningParty</th>
                                    <th className="p-6 md:p-8 text-red-400 font-bold text-sm uppercase tracking-widest w-1/4 border-l border-white/5 bg-red-500/[0.02]">Jukebox Duo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Guest access', spotify: 'All need Premium', lp: 'Spotify/Apple account required', duo: 'Free — no login needed', spotifyBad: true, lpBad: true },
                                    { feature: 'Max listeners', spotify: '32 people cap', lp: 'Varies', duo: '100+ simultaneous', spotifyBad: true, lpBad: false },
                                    { feature: 'Host control', spotify: 'Shared with everyone', lp: 'Limited controls', duo: 'Full host-only control', spotifyBad: true, lpBad: true },
                                    { feature: 'App required', spotify: 'Spotify app', lp: 'Web (needs streaming login)', duo: 'Any browser — nothing else', spotifyBad: true, lpBad: true },
                                    { feature: 'Ads', spotify: 'Ads for free-tier users', lp: 'Platform dependent', duo: 'Always ad-free', spotifyBad: true, lpBad: false },
                                    { feature: 'Sync quality', spotify: 'Noticeable drift', lp: 'Varies by platform', duo: '< 1s WebSocket sync', spotifyBad: true, lpBad: false },
                                    { feature: 'Persistent rooms', spotify: 'No — sessions expire', lp: 'No', duo: 'Yes — rooms stay open', spotifyBad: true, lpBad: true },
                                    { feature: 'Mobile support', spotify: 'App only', lp: 'Web', duo: 'Any browser + iOS auto-unlock', spotifyBad: true, lpBad: false },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group">
                                        <td className="p-6 md:p-8 font-semibold text-white/90 group-hover:text-white transition-colors">{row.feature}</td>
                                        <td className="p-6 md:p-8 border-l border-white/5">
                                            <div className="flex items-start gap-3">
                                                {row.spotifyBad ? (
                                                    <div className="mt-0.5 p-1 rounded-full bg-red-500/10 flex-shrink-0">
                                                        <X className="w-4 h-4 text-red-500" />
                                                    </div>
                                                ) : (
                                                    <div className="mt-0.5 p-1 rounded-full bg-gray-500/10 flex-shrink-0">
                                                        <Check className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                )}
                                                <span className={`${row.spotifyBad ? 'text-gray-500 font-medium' : 'text-gray-400'}`}>{row.spotify}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 md:p-8 border-l border-white/5">
                                            <div className="flex items-start gap-3">
                                                {row.lpBad ? (
                                                    <div className="mt-0.5 p-1 rounded-full bg-red-500/10 flex-shrink-0">
                                                        <X className="w-4 h-4 text-red-500" />
                                                    </div>
                                                ) : (
                                                    <div className="mt-0.5 p-1 rounded-full bg-gray-500/10 flex-shrink-0">
                                                        <Check className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                )}
                                                <span className={`${row.lpBad ? 'text-gray-500 font-medium' : 'text-gray-400'}`}>{row.lp}</span>
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
                {/* WHY JUKEBOX DUO IS #1 FOR EVENTS */}
                {/* ============================================ */}
                <AnimatedSection delay={0.2} className="container mx-auto px-4 max-w-5xl mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 inline-block relative">
                            Why Jukebox Duo Is #1 for Hosting Music Events
                            <div className="absolute -bottom-2 right-0 w-2/3 h-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
                        </h2>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto mt-6">
                            Purpose-built for event hosting — not bolted on as an afterthought.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users className="w-7 h-7" />,
                                title: 'Guests Join Free',
                                desc: 'Share a link. That\'s it. No sign-up, no subscription, no app download. Your guests are listening in seconds.',
                            },
                            {
                                icon: <Zap className="w-7 h-7" />,
                                title: '100+ Simultaneous Listeners',
                                desc: 'Host events at scale. Our WebSocket sync engine handles 100+ listeners with sub-second latency.',
                            },
                            {
                                icon: <Shield className="w-7 h-7" />,
                                title: 'Full Host Control',
                                desc: 'You are the DJ. Only you can add, remove, skip, and reorder songs. Guests are synced read-only listeners.',
                            },
                            {
                                icon: <Globe className="w-7 h-7" />,
                                title: 'Works in Any Browser',
                                desc: 'Desktop, mobile, tablet — Chrome, Safari, Firefox, Edge. If it has a browser, your guests can listen.',
                            },
                            {
                                icon: <Volume2 className="w-7 h-7" />,
                                title: 'Always Ad-Free',
                                desc: 'No ads interrupt your event. Not for you, not for your guests. The music plays uninterrupted, always.',
                            },
                            {
                                icon: <Share2 className="w-7 h-7" />,
                                title: 'Shareable Event Links',
                                desc: 'Each event gets a unique tokenized link. Share via social media, email, QR code, or any messaging app.',
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
                {/* HOW IT WORKS */}
                {/* ============================================ */}
                <AnimatedSection delay={0.2} id="how-it-works" className="container mx-auto px-4 max-w-4xl mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 inline-block relative">
                            How to Host a Listening Party in 3 Steps
                            <div className="absolute -bottom-2 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
                        </h2>
                        <p className="text-gray-400 text-xl mt-6">
                            From sign-up to live event in under a minute.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-[4.5rem] left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>

                        {[
                            {
                                step: '01',
                                title: 'Subscribe to Event Pro',
                                desc: 'Get Event Pro ($9.99/mo) from your dashboard and unlock event hosting with full host control.',
                                icon: <Crown className="w-8 h-8 text-red-400" />,
                            },
                            {
                                step: '02',
                                title: 'Share Your Event Link',
                                desc: 'Each event generates a unique shareable link. Send it via WhatsApp, Discord, X, email — anywhere.',
                                icon: <Share2 className="w-8 h-8 text-blue-400" />,
                            },
                            {
                                step: '03',
                                title: 'Go Live',
                                desc: 'Queue your songs, hit play, and your entire audience is synced. You control everything from your host panel.',
                                icon: <Radio className="w-8 h-8 text-green-400" />,
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
                            The Complete Guide to Hosting Virtual Listening Parties in 2026
                        </h2>

                        <p className="text-lg leading-relaxed mb-8">
                            Virtual listening parties have evolved from niche experiments into a central pillar of how artists, DJs, and music communities share experiences online.
                            Whether you&apos;re planning an album release event, a DJ set for your followers, a corporate team-building session, or a digital silent disco,
                            the right platform makes the difference between an unforgettable event and a frustrating one.
                        </p>

                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-red-500">01.</span> What Is a Virtual Listening Party?
                        </h3>
                        <p className="text-lg">
                            A virtual listening party is an online event where a host streams music to a group of listeners in real time.
                            Everyone hears the same track at the same moment — perfectly synchronized — creating a shared experience despite being in different locations.
                            Use cases range from <strong>album release parties</strong> where artists debut new music with fans,
                            to <strong>DJ sets</strong> streamed to online audiences, to <strong>silent discos</strong> where every phone becomes a wireless receiver,
                            to <strong>corporate events</strong> where remote teams bond over curated playlists.
                            The key ingredient is synchronization: without it, you&apos;re just sending a playlist link.
                        </p>

                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-red-500">02.</span> Why Browser-Based Beats App-Based
                        </h3>
                        <p className="text-lg">
                            The biggest killer of event attendance is friction. Asking 100 guests to download an app, create an account, and link their streaming service
                            before they can listen means you&apos;ll lose most of them before the first song plays.
                            Jukebox Duo runs entirely in the browser — <strong>no app download, no login for guests, no streaming subscription required</strong>.
                            Your guest clicks a link and they&apos;re listening. That&apos;s it. This is why browser-based platforms are the future of
                            online listening events, and why traditional apps like Spotify Jam struggle with event-scale audiences.
                        </p>

                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-red-500">03.</span> The Host Control Difference
                        </h3>
                        <p className="text-lg">
                            Most music sharing platforms were built for casual collaborative listening — everyone can add songs, skip tracks, and control playback.
                            That&apos;s great for a small group of friends, but it&apos;s a disaster for events.
                            Imagine hosting an album listening party where a random guest skips your track, or a DJ set where someone adds a completely off-vibe song to the queue.
                            Jukebox Duo&apos;s event mode gives the host <strong>full DJ-level control</strong>: only the host can add, remove, skip, and reorder songs.
                            Guests are synced read-only listeners who enjoy the experience you curate. This is what separates a real event platform from a group playlist app.
                        </p>

                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <span className="text-red-500">04.</span> Scaling Beyond 32 Listeners
                        </h3>
                        <p className="text-lg">
                            Spotify Jam caps at 32 participants. Amazon Music Listening Party limits you to 10.
                            These numbers work for a small friend group, but they&apos;re completely inadequate for any real event.
                            Jukebox Duo supports <strong>100+ simultaneous listeners</strong> per event room, powered by a dedicated
                            WebSocket sync engine that maintains sub-second latency across all connected clients.
                            Whether you&apos;re streaming to 20 people or 200, everyone hears the exact same millisecond of the track.
                        </p>

                        <div className="space-y-10 not-prose mt-12">
                            <h3 className="text-2xl font-bold text-white">How Jukebox Duo Compares to Other Event Platforms</h3>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-xl font-bold text-white mb-3">Jukebox Duo vs ListeningParty.com</h4>
                                <p className="text-gray-400 leading-relaxed">
                                    <strong className="text-white">ListeningParty.com</strong> syncs streams from Spotify, Apple Music, and other services alongside a real-time chat.
                                    However, it requires every listener to have their own streaming account logged in — which limits your audience to people who already pay for a music service.
                                    <strong className="text-red-400"> Jukebox Duo</strong> eliminates that barrier entirely: guests click a link and listen in their browser with zero requirements.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-xl font-bold text-white mb-3">Jukebox Duo vs Lysn.in & MySilentDisco.club</h4>
                                <p className="text-gray-400 leading-relaxed">
                                    <strong className="text-white">Silent disco apps</strong> like Lysn.in and MySilentDisco.club are built for in-person events where everyone is on the same WiFi network.
                                    They excel at physical venues but don&apos;t work well for remote or online events.
                                    <strong className="text-red-400"> Jukebox Duo</strong> works over the internet from anywhere in the world — your listeners can be in the same room or on different continents.
                                    Every phone becomes a synced receiver without any hardware or WiFi proximity requirements.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-xl font-bold text-white mb-3">Jukebox Duo vs Spotify Jam</h4>
                                <p className="text-gray-400 leading-relaxed">
                                    <strong className="text-white">Spotify Jam</strong> requires every participant to have Spotify Premium ($11.99/mo), caps at 32 people,
                                    and gives shared control to all participants — meaning anyone can disrupt your queue.
                                    <strong className="text-red-400"> Jukebox Duo</strong> lets guests join free with no subscription, supports 100+ listeners,
                                    and gives the host exclusive control over playback. For events, there&apos;s no comparison.
                                    Learn more on our <Link href="/spotify-jam-alternative" className="text-red-400 hover:text-red-300 underline underline-offset-2">Spotify Jam Alternative</Link> page.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-xl font-bold text-white mb-3">Jukebox Duo vs Bandcamp Listening Parties</h4>
                                <p className="text-gray-400 leading-relaxed">
                                    <strong className="text-white">Bandcamp Listening Parties</strong> are great for artists releasing on Bandcamp, offering real-time chat and direct purchases.
                                    But they&apos;re limited to the Bandcamp catalog and designed for album release contexts only.
                                    <strong className="text-red-400"> Jukebox Duo</strong> works with any music from YouTube&apos;s catalog, supports any type of event (not just releases),
                                    and gives hosts full playback control with persistent rooms that stay open for recurring events.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* FAQ SECTION */}
                {/* ============================================ */}
                <section className="container mx-auto px-4 max-w-4xl mb-32">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                        Frequently Asked Questions About Hosting Music Events Online
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
                                Ready to Host Your<br className="hidden md:block" /> First Listening Party?
                            </h2>
                            <p className="text-2xl text-red-100/90 mb-12 max-w-2xl mx-auto font-medium drop-shadow-sm">
                                Create your event room in 10 seconds. Your guests join completely free.
                            </p>
                            <Link href="/signin" className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black rounded-full font-black text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)]">
                                Start Hosting Free
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
