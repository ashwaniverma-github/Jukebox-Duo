import type { Metadata } from 'next';
import HigherLowerGame from './HigherLowerGame';

export const metadata: Metadata = {
    title: 'Higher or Lower: Music Views Game | Jukebox Duo',
    description:
        'Can you guess which song has more YouTube views? Play the free music trivia game — no signup required. Challenge your friends and test your music knowledge!',
    keywords: [
        'music game',
        'higher or lower',
        'higher or lower music edition',
        'youtube views game',
        'music trivia',
        'guess the views',
        'song popularity quiz',
        'music quiz',
        'free music game',
        'higher lower game',
        'most viewed songs',
    ],
    alternates: {
        canonical: 'https://jukeboxduo.com/games/higher-lower',
    },
    openGraph: {
        title: 'Higher or Lower: Music Views Game | Jukebox Duo',
        description:
            'Can you guess which song has more YouTube views? Free music trivia game — no signup required.',
        url: 'https://jukeboxduo.com/games/higher-lower',
        siteName: 'Jukebox Duo',
        locale: 'en_US',
        type: 'website',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Higher or Lower Music Views Game — Jukebox Duo',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Higher or Lower: Music Views Game',
        description: 'Guess which song has more YouTube views! Free. No signup.',
        images: ['/og-image.png'],
    },
};

// JSON-LD structured data
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Higher or Lower: Music Views Game',
    description:
        'A free music trivia game where you guess which song has more YouTube views.',
    url: 'https://jukeboxduo.com/games/higher-lower',
    genre: 'Trivia',
    gamePlatform: 'Web Browser',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
    author: {
        '@type': 'Organization',
        name: 'Jukebox Duo',
        url: 'https://jukeboxduo.com',
    },
};

const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'What is the Higher or Lower Music Game?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: "It's a free music trivia game where you're shown two songs and have to guess which has more YouTube views. No signup required — just play!",
            },
        },
        {
            '@type': 'Question',
            name: 'What is the most viewed music video on YouTube?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: "'Baby Shark Dance' by Pinkfong currently holds the record as the most-viewed YouTube video ever, followed by 'Despacito' by Luis Fonsi ft. Daddy Yankee.",
            },
        },
        {
            '@type': 'Question',
            name: 'Do I need to sign up to play?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'No, the game is completely free and requires no account. Just visit the page and start playing immediately.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can I listen to these songs with friends?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! Jukebox Duo lets you create synchronized listening rooms where you and your friends can listen to YouTube music together in real-time, for free.',
            },
        },
    ],
};

export default function HigherLowerPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <HigherLowerGame />
        </>
    );
}
