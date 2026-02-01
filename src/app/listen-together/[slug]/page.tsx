import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getListenTogetherPage, getListenTogetherSlugs } from '@/lib/seo-data';
import Footer from '@/components/Footer';
import { CONFIG } from '@/lib/config';

// Generate static params for all listen-together pages
export async function generateStaticParams() {
    const slugs = getListenTogetherSlugs();
    return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each page
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;
    const page = getListenTogetherPage(slug);

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
            url: `https://jukeboxduo.com/listen-together/${slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: page.title,
            description: page.description,
        },
        alternates: {
            canonical: `https://jukeboxduo.com/listen-together/${slug}`,
        },
    };
}

export default async function ListenTogetherPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const page = getListenTogetherPage(slug);

    if (!page) {
        notFound();
    }

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

            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex flex-col items-center justify-center pt-24 px-4">
                <div className="container mx-auto text-center max-w-4xl">
                    {/* Category Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-sm text-gray-300 font-medium capitalize">
                            {page.category} • Listen Together
                        </span>
                    </div>

                    {/* Hero Title */}
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                        {page.heroTitle}
                    </h1>

                    {/* Hero Subtitle */}
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {page.heroSubtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/signin"
                            className="group relative px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all hover:scale-105 flex items-center gap-2"
                        >
                            Start Listening Together
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            <div className="absolute inset-0 rounded-full ring-4 ring-red-600/20 group-hover:ring-red-600/40 transition-all" />
                        </Link>
                        <Link
                            href="/#features"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-semibold transition-all hover:scale-105"
                        >
                            See How It Works
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Why Listen Together?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {page.benefits.map((benefit, index) => (
                            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium text-gray-200">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deep Dive Content Section */}
            <section className="relative py-24 px-4 bg-white/[0.02]">
                <div className="container mx-auto max-w-4xl">
                    <div className="prose prose-invert prose-p:text-gray-400 prose-headings:text-white max-w-none">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8">
                            Experience {page.heroTitle} Like Never Before
                        </h2>

                        <div className="space-y-12">
                            <div>
                                <h3 className="text-2xl font-bold text-red-500 mb-4">Perfect Real-Time Synchronization</h3>
                                <p className="text-lg leading-relaxed">
                                    Nothing brings people together like music. Jukebox Duo is built on a proprietary synchronization engine that ensures
                                    every participant in your room hears the exact same beat at the exact same millisecond. Whether you&apos;re listening to
                                    {page.slug.replace(/-/g, ' ')} or your favorite lo-fi beats, the experience is seamless and lag-free. No more
                                    &quot;one-two-three-play&quot; countdowns—just pure, synchronized musical bliss.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-red-500 mb-4">Built for {page.category === 'artist' ? 'Fans' : 'Your Vibe'}</h3>
                                <p className="text-lg leading-relaxed">
                                    {page.category === 'artist'
                                        ? `Calling all fans! Our platform is the ultimate destination for virtual listening parties. Share your favorite tracks, 
                                           discuss lyrics in real-time, and experience the full emotional range of the artist&apos;s work with your friends. 
                                           It&apos;s like being at a private concert, but from the comfort of your own homes.`
                                        : `Whether you're looking for concentration, relaxation, or high-energy motivation, our synchronized rooms 
                                           provide the perfect environment. Sharing a mood through music is a powerful way to connect, and we've 
                                           made it easier than ever to invite others into your world.`
                                    }
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-red-500 mb-4">No Downloads, No Hassle</h3>
                                <p className="text-lg leading-relaxed">
                                    Jukebox Duo runs entirely in your web browser. There&apos;s no bulky software to download or complicated setup
                                    procedures. Simply create a room, share the unique link with your friends (or partner), and start adding
                                    songs from our extensive library. We&apos;ve optimized the platform for both desktop and mobile, so the party
                                    never has to stop.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-red-500 mb-4">Collaborative Listening Redefined</h3>
                                <p className="text-lg leading-relaxed">
                                    Our collaborative queue feature allows everyone in the room to have a voice. Add tracks, vote on what&apos;s next,
                                    and discover new music through the tastes of your friends. It&apos;s not just about listening—it&apos;s about
                                    creating a unique musical journey together, one track at a time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section className="relative py-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-red-500/20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to listen together?
                        </h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Create your first room in seconds. It&apos;s free!
                        </p>
                        <Link
                            href="/signin"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all hover:scale-105"
                        >
                            Get Started Free
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
