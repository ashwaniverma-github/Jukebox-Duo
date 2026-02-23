// SEO Data for Programmatic Pages
// This file contains all the keyword-targeted content for generating landing pages

export interface ListenTogetherPage {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    heroTitle: string;
    heroSubtitle: string;
    category: 'artist' | 'genre' | 'mood';
    benefits: string[];
}

export interface ForPage {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    heroTitle: string;
    heroSubtitle: string;
    benefits: string[];
}

export interface FocusPage {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    heroTitle: string;
    heroSubtitle: string;
    benefits: string[];
}

export interface AlternativePage {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    heroTitle: string;
    heroSubtitle: string;
    benefits: string[];
    comparisonPoints: {
        feature: string;
        spotify?: string;
        ytMusic?: string;
        jukeboxDuo: string;
    }[];
    faqs?: {
        q: string;
        a: string;
    }[];
    highlights?: {
        title: string;
        desc: string;
        icon: string;
    }[];
}

// Listen Together Pages - Target searches like "listen to [artist] together online"
export const listenTogetherPages: ListenTogetherPage[] = [
    // Artists
    {
        slug: 'taylor-swift',
        title: 'Listen to Taylor Swift Together | Jukebox Duo',
        description: 'Enjoy Taylor Swift songs with friends in real-time. Create a synced listening room in your browser for the best desktop experience and share the Swiftie vibe.',
        keywords: ['taylor swift listen together', 'taylor swift with friends', 'swiftie music party', 'taylor swift synced'],
        heroTitle: 'Listen to Taylor Swift Together',
        heroSubtitle: 'Share the Eras Tour vibes with friends in perfect sync. Optimized for the best experience on desktop and browsers.',
        category: 'artist',
        benefits: [
            'Sing along to every Era in perfect sync',
            'Full support for desktop and browser listening',
            'Perfect for album release listening parties',
        ],
    },
    {
        slug: 'ed-sheeran',
        title: 'Listen to Ed Sheeran Together | Jukebox Duo',
        description: 'Share Ed Sheeran\'s music with loved ones in real-time. Perfect for long-distance couples who want to listen together.',
        keywords: ['ed sheeran listen together', 'ed sheeran romantic songs', 'listen with partner'],
        heroTitle: 'Listen to Ed Sheeran Together',
        heroSubtitle: 'Perfect for couples. Share his romantic ballads in perfect sync with your special someone.',
        category: 'artist',
        benefits: [
            'Harmonize with friends on acoustic tracks',
            'Share romantic moments with "Perfect" sync',
            'Great for chill evening listening sessions',
        ],
    },
    {
        slug: 'the-weeknd',
        title: 'Listen to The Weeknd Together | Jukebox Duo',
        description: 'Experience The Weeknd\'s hits with friends in synchronized listening sessions. Vibe together to Blinding Lights and more.',
        keywords: ['the weeknd listen together', 'weeknd party music', 'blinding lights together'],
        heroTitle: 'Listen to The Weeknd Together',
        heroSubtitle: 'After Hours vibes with your crew. Sync up and experience the sound together.',
        category: 'artist',
        benefits: [
            'Vibe to the synth-pop beats together',
            'Perfect for late-night driving vibes remotely',
            'Experience the cinematic production in sync',
        ],
    },
    {
        slug: 'drake',
        title: 'Listen to Drake Together | Jukebox Duo',
        description: 'Share Drake\'s albums with friends in real-time. From Scorpion to Certified Lover Boy, listen together.',
        keywords: ['drake listen together', 'drake album party', 'listen to drake with friends'],
        heroTitle: 'Listen to Drake Together',
        heroSubtitle: 'God\'s Plan for listening parties. Share every bar with your squad in perfect sync.',
        category: 'artist',
        benefits: [
            'Rap along to every bar with your squad',
            'Hype each other up with high-energy tracks',
            'Debate the best tracks in real-time',
        ],
    },
    {
        slug: 'ariana-grande',
        title: 'Listen to Ariana Grande Together | Jukebox Duo',
        description: 'Enjoy Ariana Grande\'s vocals with friends in synchronized sessions. Perfect for fan listening parties.',
        keywords: ['ariana grande listen together', 'ariana fan party', 'ariana grande sync'],
        heroTitle: 'Listen to Ariana Grande Together',
        heroSubtitle: 'Thank U, Next-level listening experience. Sync with friends and hit those high notes together.',
        category: 'artist',
        benefits: [
            'Hit those high notes together (or try to)',
            'Host the ultimate pop diva listening party',
            'Sync up for "7 rings" style fun',
        ],
    },
    {
        slug: 'bts',
        title: 'Listen to BTS Together | Jukebox Duo',
        description: 'Join ARMY worldwide in synchronized BTS listening sessions. Experience K-pop together, no matter where you are.',
        keywords: ['bts listen together', 'bts army party', 'kpop listen together', 'bts sync'],
        heroTitle: 'Listen to BTS Together',
        heroSubtitle: 'ARMY unite! Experience every song together with fans worldwide in perfect sync.',
        category: 'artist',
        benefits: [
            'Perfect fanchants in sync across the world',
            'Experience the choreography beats together',
            'Connect with fellow ARMY friends instantly',
        ],
    },
    // Genres & Moods
    {
        slug: 'lo-fi-beats',
        title: 'Lo-Fi Beats to Study Together | Jukebox Duo',
        description: 'Study together with lo-fi hip hop beats. Create a shared study room with calming music synced for everyone.',
        keywords: ['lo-fi study together', 'lo-fi beats sync', 'study music with friends', 'lofi hip hop together'],
        heroTitle: 'Lo-Fi Beats to Study Together',
        heroSubtitle: 'Create a virtual study room with chill beats. Stay focused with friends, even miles apart.',
        category: 'mood',
        benefits: [
            'Focus deeper with shared background noise',
            'Calm vibes for efficient group study',
            'Stress-free environments for productivity',
        ],
    },
    {
        slug: 'study-music',
        title: 'Study Music Together | Jukebox Duo',
        description: 'Focus together with synchronized study music. Perfect for virtual study groups and long-distance study buddies.',
        keywords: ['study music together', 'focus music sync', 'study group music', 'concentration music friends'],
        heroTitle: 'Study Music Together',
        heroSubtitle: 'Keep each other motivated. Sync your study playlist and crush those goals together.',
        category: 'mood',
        benefits: [
            'Motivate each other to keep working',
            'Timed study blocks with synchronized tracks',
            'Create a distraction-free focus zone',
        ],
    },
    {
        slug: 'workout-playlist',
        title: 'Workout Playlist Together | Jukebox Duo',
        description: 'Get pumped together with synchronized workout music. Perfect for virtual gym buddies and fitness motivation.',
        keywords: ['workout music together', 'gym playlist sync', 'exercise music friends', 'fitness motivation'],
        heroTitle: 'Workout Playlist Together',
        heroSubtitle: 'Virtual gym buddy vibes. Sync your pump-up playlist and push each other to the limit.',
        category: 'mood',
        benefits: [
            'Sync your reps to the same beat',
            'Keep the energy high for the whole crew',
            'Virtual spotter motivation through music',
        ],
    },
    {
        slug: 'chill-vibes',
        title: 'Chill Vibes Together | Jukebox Duo',
        description: 'Relax together with synchronized chill music. Perfect for unwinding with friends after a long day.',
        keywords: ['chill music together', 'relax with friends', 'chill vibes sync', 'relaxing music'],
        heroTitle: 'Chill Vibes Together',
        heroSubtitle: 'Unwind with your people. Share the chill and decompress together, wherever you are.',
        category: 'mood',
        benefits: [
            'Decompress together after a long day',
            'Slow down the pace and just listen',
            'Perfect background for catching up',
        ],
    },
    {
        slug: '80s-hits',
        title: '80s Hits Together | Jukebox Duo',
        description: 'Travel back to the 80s together. Share classic hits and throwback vibes with friends in real-time.',
        keywords: ['80s music together', 'retro music sync', 'throwback hits friends', '80s nostalgia'],
        heroTitle: '80s Hits Together',
        heroSubtitle: 'Take On Me... together! Blast throwback hits with friends and relive the golden era.',
        category: 'genre',
        benefits: [
            'Dance like it\'s 1985 in your living rooms',
            'Sing along to timeless classics',
            'Neon vibes party for everyone invited',
        ],
    },
    {
        slug: '90s-nostalgia',
        title: '90s Nostalgia Together | Jukebox Duo',
        description: 'Relive the 90s with friends. Share your favorite throwback tracks in synchronized listening sessions.',
        keywords: ['90s music together', '90s nostalgia sync', 'throwback 90s', 'retro listening party'],
        heroTitle: '90s Nostalgia Together',
        heroSubtitle: 'Hit me baby one more time... with your crew! Sync up for the ultimate 90s throwback party.',
        category: 'genre',
        benefits: [
            'Relive the golden era of boy bands',
            'Harmonize to grunge and pop classics',
            'Unlock core memories with friends',
        ],
    },
    {
        slug: 'bollywood-hits',
        title: 'Bollywood Hits Together | Jukebox Duo',
        description: 'Share Bollywood music with friends and family. Perfect for desi listening parties and movie soundtrack sessions.',
        keywords: ['bollywood music together', 'hindi songs sync', 'desi music party', 'bollywood listening'],
        heroTitle: 'Bollywood Hits Together',
        heroSubtitle: 'From classic melodies to latest chartbusters. Share the magic of Bollywood with your loved ones.',
        category: 'genre',
        benefits: [
            'Thumka together to high energy beats',
            'Antakshari vibes for the digital age',
            'Feel the filmy magic with your squad',
        ],
    },
    {
        slug: 'anime-ost',
        title: 'Anime OST Together | Jukebox Duo',
        description: 'Experience anime soundtracks with fellow fans. Share your favorite openings and endings in real-time.',
        keywords: ['anime music together', 'anime ost sync', 'anime opening together', 'otaku listening party'],
        heroTitle: 'Anime OST Together',
        heroSubtitle: 'From Naruto to Demon Slayer. Experience epic anime soundtracks with your nakama.',
        category: 'genre',
        benefits: [
            'Sing your favorite openings at top volume',
            'Feel the emotional moments in sync',
            'Epic battle music for gaming sessions',
        ],
    },
];

// For Pages - Target searches like "music app for [use case]"
export const forPages: ForPage[] = [
    {
        slug: 'long-distance-couples',
        title: 'Music App for Long Distance Couples | Jukebox Duo',
        description: 'Stay connected with your partner through music. The best browser-based sync for long-distance couples, optimized for desktop and web.',
        keywords: ['long distance relationship music', 'ldr couples app', 'listen together browser', 'music for long distance'],
        heroTitle: 'For Long Distance Couples',
        heroSubtitle: 'Distance means nothing when you\'re sharing the same song. High-performance sync for the best desktop experience.',
        benefits: [
            'Listen to "your song" together in perfect sync',
            'Optimized for desktop and browser listening',
            'Feel closer even when miles apart',
        ],
    },
    {
        slug: 'best-friends',
        title: 'Music App for Best Friends | Jukebox Duo',
        description: 'Share music with your bestie no matter where you are. Create listening rooms and enjoy songs together in real-time.',
        keywords: ['friends music app', 'listen with friends', 'best friend music sharing', 'friend listening party'],
        heroTitle: 'For Best Friends',
        heroSubtitle: 'Same vibe, different cities. Stay connected with your bestie through music.',
        benefits: [
            'Discover new music together',
            'Host virtual listening parties',
            'React to songs in real-time',
        ],
    },
    {
        slug: 'study-sessions',
        title: 'Music App for Study Sessions | Jukebox Duo',
        description: 'Focus together with synchronized study music. Create virtual study rooms in your browser, optimized for the best desktop experience.',
        keywords: ['study music app', 'study together online browser', 'focus music desktop', 'virtual study room sync'],
        heroTitle: 'For Study Sessions',
        heroSubtitle: 'Stay focused together. Sync your study playlist in your browser for a seamless desktop experience.',
        benefits: [
            'Create virtual study rooms with friends',
            'Best performance on desktop and browser',
            'Stay motivated with synchronized music',
        ],
    },
    {
        slug: 'workout-buddies',
        title: 'Music App for Workout Buddies | Jukebox Duo',
        description: 'Get pumped together with synchronized workout playlists. Perfect for virtual gym partners and fitness friends.',
        keywords: ['workout music app', 'gym buddy app', 'fitness music sync', 'workout together'],
        heroTitle: 'For Workout Buddies',
        heroSubtitle: 'No excuses when your gym buddy is with you. Sync your pump-up playlist and push together.',
        benefits: [
            'Sync high-energy playlists',
            'Stay accountable with virtual workouts',
            'Push each other with the same beats',
        ],
    },
    {
        slug: 'road-trips',
        title: 'Music App for Road Trips | Jukebox Duo',
        description: 'Create the perfect road trip playlist together. Sync music across cars or plan your journey soundtrack.',
        keywords: ['road trip music app', 'travel playlist', 'driving music sync', 'road trip together'],
        heroTitle: 'For Road Trips',
        heroSubtitle: 'Windows down, volume up. Sync your road trip playlist and enjoy the journey together.',
        benefits: [
            'Create collaborative road trip playlists',
            'Sync across multiple cars in a convoy',
            'Everyone gets a say in the queue',
        ],
    },
    {
        slug: 'virtual-parties',
        title: 'Music App for Virtual Parties | Jukebox Duo',
        description: 'Host the ultimate virtual party with synchronized music. Everyone hears the same beat at the same time.',
        keywords: ['virtual party music', 'online party app', 'remote party sync', 'virtual dance party'],
        heroTitle: 'For Virtual Parties',
        heroSubtitle: 'The party doesn\'t stop because you\'re apart. Sync the beat and dance together.',
        benefits: [
            'Everyone hears the same drop at the same time',
            'Take turns being the DJ',
            'Party with friends worldwide',
        ],
    },
    {
        slug: 'movie-nights',
        title: 'Music App for Movie Nights | Jukebox Duo',
        description: 'Set the mood for virtual movie nights with synchronized music. Perfect soundtrack for your watch parties.',
        keywords: ['movie night music', 'watch party app', 'virtual movie night', 'movie soundtrack'],
        heroTitle: 'For Movie Nights',
        heroSubtitle: 'Set the perfect mood before the movie starts. Sync your pre-show playlist with friends.',
        benefits: [
            'Build anticipation with themed playlists',
            'Discuss music while waiting for stragglers',
            'Create movie soundtrack rooms',
        ],
    },
    {
        slug: 'family',
        title: 'Music App for Family | Jukebox Duo',
        description: 'Connect with family through music. Share songs across generations and stay close no matter the distance.',
        keywords: ['family music app', 'share music family', 'family listening', 'music with parents'],
        heroTitle: 'For Family',
        heroSubtitle: 'Music connects generations. Share your favorites with family, wherever they are.',
        benefits: [
            'Share music across generations',
            'Stay connected with distant relatives',
            'Create family playlists together',
        ],
    },
];

// Focus Pages - Target solo listeners, desktop users, and study sessions
export const focusPages: FocusPage[] = [
    {
        slug: 'study-sessions',
        title: 'Ad-Free Study Music Player for Desktop | Jukebox Duo',
        description: 'Focus on your studies with an ad-free, browser-based music player optimized for desktop. No algorithmic distractions, just your music.',
        keywords: ['study music desktop app', 'ad free study music', 'focus music player browser', 'no distraction music app', 'study sessions music'],
        heroTitle: 'Deep Focus for Study Sessions',
        heroSubtitle: '100% Ad-free. No algorithmic distractions. Just you, your playlist, and deep work perfectly optimized for your desktop browser.',
        benefits: [
            'Zero ads to interrupt your flow state',
            'No algorithmic suggestions to distract you',
            'Lightweight browser app, no bloated installations',
            'Queue up exactly what you want to hear',
        ],
    },
    {
        slug: 'deep-work',
        title: 'Music Player for Deep Work & Coding | Jukebox Duo',
        description: 'The ultimate web music player for deep work, coding, and productivity. Build your queue and work without ad interruptions.',
        keywords: ['deep work music app', 'music player for coding', 'desktop music app productivity', 'browser music player work'],
        heroTitle: 'Soundtrack Your Deep Work',
        heroSubtitle: 'Enter the flow state. A distraction-free music environment built for professionals, coders, and creators.',
        benefits: [
            'Clean, minimalist interface that stays out of your way',
            'High-quality audio playback in your browser',
            'Create the perfect uninterrupted workflow playlist',
            'Not a Discord bot—a dedicated desktop web experience',
        ],
    },
    {
        slug: 'adhd-focus',
        title: 'Ad-Free Focus Music App (No Distractions) | Jukebox Duo',
        description: 'Tame distractions with a music app that only plays what you tell it to. Perfect for ADHD focus sessions and preventing doom-scrolling.',
        keywords: ['adhd focus music app', 'no distraction music player', 'music app without recommendations', 'focus app browser'],
        heroTitle: 'Music Without Distractions',
        heroSubtitle: 'Stop getting lost in algorithmic rabbit holes. You control the queue, we provide the ad-free playback.',
        benefits: [
            'No "Up Next" algorithms to hijack your attention',
            'No visual clutter or social feeds',
            'Predictable, ad-free listening environments',
            'Perfect tool for time-blocking and pomodoro sessions',
        ],
    },
    {
        slug: 'solo-listening',
        title: 'Minimalist Solo Music Player for Web | Jukebox Duo',
        description: 'Enjoy a pure, uncluttered music experience on your desktop. A minimalist web player for when you just want to listen alone.',
        keywords: ['solo music player web', 'minimalist desktop music app', 'browser audio player', 'simple music queue app'],
        heroTitle: 'Pure Solo Listening',
        heroSubtitle: 'Sometimes you just want to listen alone. Experience music on your desktop without the noise of modern streaming apps.',
        benefits: [
            'Stripped back to the essentials of playback',
            'Instantly loads in any desktop browser',
            'No social pressure or sharing requirements',
            'Your private, ad-free listening sanctuary',
        ],
    }
];

// Alternative Pages - Target searches like "[Service] alternative"
export const alternativePages: AlternativePage[] = [
    {
        slug: 'spotify',
        title: 'Best Ad-Free Spotify Alternative | Jukebox Duo',
        description: 'Looking for a Spotify alternative? Experience ad-free synchronized music in your browser, optimized for the best desktop experience.',
        keywords: ['spotify alternative browser', 'ad-free music app', 'listen together spotify', 'spotify group session'],
        heroTitle: 'The Social Alternative to Spotify',
        heroSubtitle: 'Lightweight and browser-based. Switch to Jukebox Duo for the best synchronized listening on desktop.',
        benefits: [
            '100% Ad-free listening experience',
            'Perfectly synchronized rooms for groups',
            'Best experience on desktop and browser',
            'Free for all participants',
        ],
        comparisonPoints: [
            {
                feature: 'Ads',
                spotify: 'Interruptive Ads',
                jukeboxDuo: 'Crystal Clear & Ad-Free',
            },
            {
                feature: 'Group Sessions',
                spotify: 'Requires Premium for all',
                jukeboxDuo: 'Free for all participants',
            },
            {
                feature: 'Sync Quality',
                spotify: 'Occasional drift',
                jukeboxDuo: 'Ultra-low latency sync',
            },
            {
                feature: 'Pricing',
                spotify: 'Subscription only',
                jukeboxDuo: 'Affordable Lifetime Deal',
            },
        ],
        highlights: [
            {
                title: 'No Social Premium Tax',
                desc: 'Unlike Spotify, your friends don\'t need to pay for premium just to join your listening party.',
                icon: 'group',
            },
            {
                title: 'Unmatched Sync Engine',
                desc: 'Our proprietary engine ensures everyone hears the exact same millisecond of the track.',
                icon: 'sync',
            },
            {
                title: 'Privacy Focused',
                desc: 'We don\'t track your every move or sell your listening data to advertisers.',
                icon: 'shield',
            },
        ],
        faqs: [
            {
                q: 'Is Jukebox Duo really a free Spotify alternative?',
                a: 'Yes! While we offer a premium lifetime deal for extra features, our core synchronized listening is free and ad-free for everyone.',
            },
            {
                q: 'Do my friends need an account to listen together?',
                a: 'They can join as guests or create a quick account. Unlike Spotify, they never need a paid subscription to join a room.',
            },
            {
                q: 'Can I import my Spotify or YouTube Music playlists?',
                a: 'Yes! We support seamless YouTube Music playlist imports. You can add songs in bulk, import your favorites, and enjoy them ad-free with friends.',
            },
            {
                q: 'How is it better than Spotify Jam?',
                a: 'Spotify Jam often has sync issues and requires everyone to have Premium. Jukebox Duo is built for zero-latency and works for everyone, regardless of their status.',
            },
        ],
    },
    {
        slug: 'youtube-music',
        title: 'YouTube Music Alternative for Social Listening | Jukebox Duo',
        description: 'Best YouTube Music alternative for listening with friends. Ad-free, high quality, and perfectly synced musical experiences.',
        keywords: ['youtube music alternative', 'yt music alternative', 'listen together yt music', 'ad free music'],
        heroTitle: 'Better Social Listening than YT Music',
        heroSubtitle: 'Upgrade your group listening. Jukebox Duo offers better sync and a more social way to enjoy music together.',
        benefits: [
            'Seamless ad-free music playback',
            'Superior real-time synchronization',
            'Dedicated social listening features',
            'One-time payment options',
        ],
        comparisonPoints: [
            {
                feature: 'Social Experience',
                ytMusic: 'Basic sharing',
                jukeboxDuo: 'Interactive synced rooms',
            },
            {
                feature: 'Audio Visuals',
                ytMusic: 'Static UI',
                jukeboxDuo: 'Dynamic & immersive design',
            },
            {
                feature: 'Cost',
                ytMusic: 'Monthly subscription',
                jukeboxDuo: 'Cheap lifetime access',
            },
            {
                feature: 'Ads',
                ytMusic: 'Heavy on ads (Free)',
                jukeboxDuo: 'Always ad-free experience',
            },
        ],
        highlights: [
            {
                title: 'Seamless Room Transitions',
                desc: 'Switch between tracks and room settings without ever losing sync with your friends.',
                icon: 'zap',
            },
            {
                title: 'Visual Music Experience',
                desc: 'Our UI reacts to the music, creating a more immersive experience than YT Music\'s standard player.',
                icon: 'view',
            },
            {
                title: 'Global Accessibility',
                desc: 'Listen together with friends from any country without region lock issues found in other apps.',
                icon: 'globe',
            },
        ],
        faqs: [
            {
                q: 'Is Jukebox Duo better than YouTube Music for parties?',
                a: 'Absolutely. While YT Music is good for solo listening, Jukebox Duo is built specifically for group synchronization and shared control.',
            },
            {
                q: 'Can I import my YouTube Music playlists?',
                a: 'Yes! Jukebox Duo supports bulk importing for YouTube Music playlists. Move your entire library over in seconds and enjoy an ad-free group experience.',
            },
            {
                q: 'Can I use Jukebox Duo alongside YouTube Music?',
                a: 'Yes! You can use us for your social listening sessions and keep your personal playlists on YT Music.',
            },
        ],
    },
];

// Helper to get all slugs for static generation
export function getListenTogetherSlugs(): string[] {
    return listenTogetherPages.map(page => page.slug);
}

export function getForSlugs(): string[] {
    return forPages.map(page => page.slug);
}

export function getFocusSlugs(): string[] {
    return focusPages.map(page => page.slug);
}

export function getAlternativeSlugs(): string[] {
    return alternativePages.map(page => page.slug);
}

// Helper to find page data by slug
export function getListenTogetherPage(slug: string): ListenTogetherPage | undefined {
    return listenTogetherPages.find(page => page.slug === slug);
}

export function getForPage(slug: string): ForPage | undefined {
    return forPages.find(page => page.slug === slug);
}

export function getFocusPage(slug: string): FocusPage | undefined {
    return focusPages.find(page => page.slug === slug);
}

export function getAlternativePage(slug: string): AlternativePage | undefined {
    return alternativePages.find(page => page.slug === slug);
}
