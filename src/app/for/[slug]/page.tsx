import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getForPage, getForSlugs } from '@/lib/seo-data';
import Footer from '@/components/Footer';
import { CONFIG } from '@/lib/config';

// Generate static params for all "for" pages
export async function generateStaticParams() {
    const slugs = getForSlugs();
    return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each page
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;
    const page = getForPage(slug);

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
            url: `https://jukeboxduo.com/for/${slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: page.title,
            description: page.description,
        },
        alternates: {
            canonical: `https://jukeboxduo.com/for/${slug}`,
        },
    };
}

export default async function ForPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const page = getForPage(slug);

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
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-sm text-gray-300 font-medium">
                            Made for you
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
                            Try Jukebox Duo Free
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            <div className="absolute inset-0 rounded-full ring-4 ring-red-600/20 group-hover:ring-red-600/40 transition-all" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Perfect for Your Needs
                    </h2>
                    <div className="space-y-6">
                        {page.benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                            >
                                <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-300 text-lg">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        How It Works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-red-500">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Create a Room</h3>
                            <p className="text-gray-400">Sign up and create your private listening room in seconds.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-red-500">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Invite Friends</h3>
                            <p className="text-gray-400">Share your room link with anyone you want to listen with.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-red-500">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Listen in Sync</h3>
                            <p className="text-gray-400">Play any song and everyone hears it at exactly the same time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-red-500/20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to start listening together?
                        </h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Join thousands who already use Jukebox Duo. It&apos;s completely free.
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
