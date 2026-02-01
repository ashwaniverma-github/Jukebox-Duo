import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAlternativePage, getAlternativeSlugs } from '@/lib/seo-data';
import Footer from '@/components/Footer';
import { CONFIG } from '@/lib/config';
import { Check, X, Shield, Users, Zap, Eye, Globe, Headphones, Music, Sparkles, AlertCircle } from 'lucide-react';

export async function generateStaticParams() {
    const slugs = getAlternativeSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;
    const page = getAlternativePage(slug);

    if (!page) {
        return { title: 'Not Found' };
    }

    return {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        openGraph: {
            title: page.title,
            description: page.description,
            type: 'website',
            url: `https://jukeboxduo.com/alternatives/${slug}`,
        },
        alternates: {
            canonical: `https://jukeboxduo.com/alternatives/${slug}`,
        },
    };
}

export default async function AlternativePage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const page = getAlternativePage(slug);

    if (!page) {
        notFound();
    }

    const serviceName = slug === 'spotify' ? 'Spotify' : 'YouTube Music';
    const accentColor = slug === 'spotify' ? 'text-green-500' : 'text-red-500';

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'group': return <Users className="w-6 h-6" />;
            case 'sync': return <Zap className="w-6 h-6" />;
            case 'shield': return <Shield className="w-6 h-6" />;
            case 'zap': return <Sparkles className="w-6 h-6" />;
            case 'view': return <Eye className="w-6 h-6" />;
            case 'globe': return <Globe className="w-6 h-6" />;
            default: return <Music className="w-6 h-6" />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30 font-[var(--font-inter)]">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse`} />
                <div className={`absolute top-[40%] -right-[10%] w-[30%] h-[30%] ${slug === 'spotify' ? 'bg-green-600/10' : 'bg-red-600/10'} blur-[120px] rounded-full`} />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            </div>

            {/* Navbar */}
            <nav className={`fixed ${CONFIG.MAINTENANCE_MODE ? 'top-10' : 'top-0'} left-0 w-full flex items-center justify-between px-6 py-4 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5`}>
                <Link href="/" className="font-bold text-xl tracking-tight text-white group">
                    Jukebox<span className="text-red-500 group-hover:animate-pulse transition-all ml-1">Duo</span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</Link>
                    <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">About</Link>
                    <Link href="/alternatives" className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">Alternatives</Link>
                </div>
                <Link href="/signin" className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform">
                    Start Now
                </Link>
            </nav>

            <main className="relative pt-32 pb-24">
                {/* Hero section */}
                <section className="container mx-auto px-4 max-w-5xl text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Better Than {serviceName}</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
                        {page.heroTitle}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                        {page.heroSubtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/signin" className="group relative px-10 py-5 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-500 transition-all hover:shadow-[0_0_40px_-12px_rgba(220,38,38,0.5)] flex items-center gap-3">
                            Switch to Jukebox Duo
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </Link>
                        <p className="text-gray-500 text-sm font-medium">No Credit Card Required • Ad-Free Forever</p>
                    </div>
                </section>

                {/* Comparison Grid */}
                <section className="container mx-auto px-4 max-w-6xl mb-32">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* The Rival Card */}
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-8 ${accentColor} opacity-5 group-hover:scale-110 transition-transform`}>
                                <Headphones className="w-32 h-32" />
                            </div>
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <span className={`p-2 rounded-xl bg-white/5 ${accentColor}`}>
                                    <AlertCircle className="w-6 h-6" />
                                </span>
                                {serviceName} Limits
                            </h3>
                            <ul className="space-y-6">
                                {page.comparisonPoints.map((point, i) => (
                                    <li key={i} className="flex gap-4 items-start group/li">
                                        <div className="mt-1 p-1 rounded-full bg-red-500/10 text-red-500 flex-shrink-0">
                                            <X className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-300 group-hover/li:text-white transition-colors">{point.feature}</p>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                {slug === 'spotify' ? point.spotify : point.ytMusic}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Our Card */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-red-600/10 to-red-900/10 border border-red-500/20 backdrop-blur-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-red-500/20 animate-pulse">
                                <Sparkles className="w-32 h-32" />
                            </div>
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <span className="p-2 rounded-xl bg-red-500/20 text-red-500">
                                    <Music className="w-6 h-6" />
                                </span>
                                Jukebox Duo Edge
                            </h3>
                            <ul className="space-y-6">
                                {page.comparisonPoints.map((point, i) => (
                                    <li key={i} className="flex gap-4 items-start group/li">
                                        <div className="mt-1 p-1 rounded-full bg-green-500/10 text-green-500 flex-shrink-0">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover/li:text-red-400 transition-colors uppercase tracking-tight text-sm">
                                                {point.feature === 'Ads' ? 'No music disruptive ads' : `Better ${point.feature}`}
                                            </p>
                                            <p className="text-lg font-medium text-gray-200 leading-tight">
                                                {point.jukeboxDuo}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Highlights */}
                <section className="container mx-auto px-4 max-w-6xl mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Social Magic You&apos;ve Been Missing</h2>
                        <p className="text-gray-400 text-lg">Designed for human connection, not just algorithm consumption.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {page.highlights?.map((highlight, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-red-500/30 transition-all hover:-translate-y-2 group">
                                <div className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    {renderIcon(highlight.icon)}
                                </div>
                                <h4 className="text-xl font-bold mb-3">{highlight.title}</h4>
                                <p className="text-gray-500 leading-relaxed font-medium">{highlight.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Deep Dive SEO Content */}
                <section className="container mx-auto px-4 max-w-4xl mb-32">
                    <div className="prose prose-invert prose-p:text-gray-400 prose-headings:text-white max-w-none bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-16">
                        <h2 className="text-4xl font-bold mb-8 scroll-mt-24">Why Music Lovers are ditching {serviceName} for Jukebox Duo</h2>
                        <p className="text-xl leading-relaxed mb-10">
                            Streaming has become a lonely experience. While {serviceName} focus on algorithms that feed you more of the same,
                            they forgot the most important part of music: <strong>sharing it with people you love.</strong>
                        </p>

                        <div className="grid gap-12">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    <span className="text-red-500">01.</span> Ad-Free Listening for Everyone
                                </h3>
                                <p className="text-lg">
                                    Nothing kills a vibe faster than a loud advertisement. In Jukebox Duo, we believe music is sacred.
                                    Our platform is built to provide an uninterrupted experience without the premium social tax.
                                    When you invite a friend to listen, they shouldn&apos;t have to sit through 30 seconds of ads just to join your vibe.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    <span className="text-red-500">02.</span> Professional Grade Synchronization
                                </h3>
                                <p className="text-lg">
                                    Most &quot;listen together&quot; features suffer from high latency, meaning you hear the drop before your partner does.
                                    Our proprietary sync engine uses low-latency protocols to ensure that everyone in the room is hearing the
                                    exact same beat, at the exact same time. It&apos;s digital magic.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    <span className="text-red-500">03.</span> Affordable Ownership vs. Infinite Rent
                                </h3>
                                <p className="text-lg">
                                    Stop renting your social music features. Jukebox Duo offers an affordable lifetime deal because we believe
                                    you should own your experience. No recurring subs, just pure value.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="container mx-auto px-4 max-w-4xl mb-32">
                    <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {page.faqs?.map((faq, i) => (
                            <details key={i} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                                <summary className="flex items-center justify-between font-bold text-lg list-none list-inside">
                                    {faq.q}
                                    <Check className="w-5 h-5 text-red-500 group-open:rotate-45 transition-transform" />
                                </summary>
                                <p className="mt-4 text-gray-500 leading-relaxed font-medium pl-0 border-l-2 border-red-500 ml-2 pl-4">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="container mx-auto px-4 max-w-5xl">
                    <div className="relative p-12 md:p-24 rounded-[3.5rem] bg-gradient-to-br from-red-600 to-red-900 overflow-hidden text-center group">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/20 blur-[100px] rounded-full animate-pulse" />
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-black/40 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">Ready to Upgrade Your <br className="hidden md:block" /> Listening Experience?</h2>
                            <p className="text-xl md:text-2xl text-red-100/80 mb-12 max-w-2xl mx-auto font-medium">Join thousands of users who have swapped their subscriptions for a more social way to listen.</p>
                            <Link href="/signin" className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black rounded-[2rem] font-black text-xl hover:scale-105 transition-transform shadow-2xl">
                                Join Jukebox Duo Free
                                <Sparkles className="w-6 h-6 text-red-600" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
