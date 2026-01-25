export type Vibe = 'sad' | 'hype' | 'chill' | 'love' | 'party' | 'workout' | 'focus' | 'travel';

const vibeDictionaries: Record<Vibe, { prefixes: string[]; nouns: string[]; suffixes: string[] }> = {
    sad: {
        prefixes: ['Midnight', 'Lonely', 'Broken', 'Silent', 'Fading', 'Hollow', 'Melancholy', 'Lost', 'Empty', 'Tearful'],
        nouns: ['Thoughts', 'Hours', 'Hearts', 'Echoes', 'Memories', 'Dreams', 'Silence', 'Rain', 'Shadows', 'Void'],
        suffixes: ['Session', 'Vibes', 'Club', 'Radio', 'Mixtape', 'Archives', 'Chronicles', 'Hours', 'Playlist', 'FM'],
    },
    hype: {
        prefixes: ['Maximum', 'Turbo', 'Electric', 'Neon', 'Savage', 'Lit', 'Adrenaline', 'Power', 'Hyper', 'Bass'],
        nouns: ['Boost', 'Energy', 'Overload', 'Drive', 'Rush', 'Ignition', 'Force', 'Impact', 'Pulse', 'Heat'],
        suffixes: ['Mode', 'Zone', 'Anthems', 'Mix', 'Edits', 'Selects', 'Hits', 'Bangers', 'Vol. 1', 'XL'],
    },
    chill: {
        prefixes: ['Lazy', 'Cozy', 'Smooth', 'Velvet', 'Sunday', 'Mellow', 'Soft', 'Cloudy', 'Dreamy', 'Lowkey'],
        nouns: ['Morning', 'Afternoon', 'Vibes', 'Loft', 'Clouds', 'Coffee', 'Dreams', 'Sunset', 'Breeze', 'Haze'],
        suffixes: ['Lounge', 'Sess', 'Corner', 'Waves', 'Radio', 'Flow', 'Stream', 'Estates', 'Garden', 'Soul'],
    },
    love: {
        prefixes: ['Sweet', 'Romantic', 'Heart', 'Velvet', 'Midnight', 'Forever', 'Soul', 'Crush', 'Lover\'s', 'Honey'],
        nouns: ['Talk', 'Letters', 'Affair', 'Touch', 'Connection', 'Feelings', 'Dreams', 'Whispers', 'Date', 'Kiss'],
        suffixes: ['Songs', 'Tape', 'Mood', 'Stories', 'Chapters', 'Notes', 'Vows', 'Duet', 'Playlist', 'Feels'],
    },
    party: {
        prefixes: ['House', 'Club', 'Weekend', 'Late Night', 'Rooftop', 'Disco', 'Festival', 'Project', 'VIP', 'After'],
        nouns: ['Party', 'Riot', 'Fever', 'Groove', 'Life', 'Moves', 'Heat', 'Vibrations', 'Anthems', 'Scene'],
        suffixes: ['Mix', 'XXL', 'Live', 'Sets', 'World', 'Energy', 'Experience', 'Nights', 'Central', 'Domination'],
    },
    workout: {
        prefixes: ['Iron', 'Beast', 'Gym', 'Sweat', 'Power', 'Muscle', 'Cardio', 'Heavy', 'Titan', 'Active'],
        nouns: ['Grind', 'Hustle', 'Pump', 'Focus', 'Gains', 'Limits', 'Motivation', 'Zone', 'Rep', 'Set'],
        suffixes: ['Mode', 'Fuel', 'Trax', 'Essentials', 'Lab', 'Factory', 'Unit', 'Squad', 'Crew', 'Base'],
    },
    focus: {
        prefixes: ['Deep', 'Study', 'Flow', 'Silent', 'Mind', 'Brain', 'Focus', 'Alpha', 'Zen', 'Pure'],
        nouns: ['State', 'Work', 'Session', 'Waves', 'Concentration', 'Thinking', 'Space', 'Library', 'Notes', 'Zone'],
        suffixes: ['Ambience', 'Lab', 'Room', 'Station', 'Stream', 'Beats', 'Frequency', 'Signal', 'Pulse', 'Wave'],
    },
    travel: {
        prefixes: ['Road', 'Highway', 'Open', 'City', 'Ocean', 'Global', 'Wander', 'Sunset', 'Night', 'Aero'],
        nouns: ['Trip', 'Drive', 'Journey', 'Cruise', 'Lights', 'Views', 'Miles', 'Escape', 'Adventure', 'Path'],
        suffixes: ['Sounds', 'Radio', 'Music', 'Tapes', 'Compass', 'Diaries', 'Vlogs', 'Memories', 'Maps', 'Tracks'],
    },
};

export function generatePlaylistNames(vibe: Vibe, count: number = 5): string[] {
    const dictionary = vibeDictionaries[vibe];
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
        const pattern = Math.floor(Math.random() * 3); // 0: Prefix + Noun, 1: Noun + Suffix, 2: Prefix + Noun + Suffix

        const prefix = dictionary.prefixes[Math.floor(Math.random() * dictionary.prefixes.length)];
        const noun = dictionary.nouns[Math.floor(Math.random() * dictionary.nouns.length)];
        const suffix = dictionary.suffixes[Math.floor(Math.random() * dictionary.suffixes.length)];

        let name = '';
        if (pattern === 0) {
            name = `${prefix} ${noun}`;
        } else if (pattern === 1) {
            name = `${noun} ${suffix}`;
        } else {
            name = `${prefix} ${noun} ${suffix}`;
        }

        // Add some random emoji flair occasionally
        if (Math.random() > 0.7) {
            const emojis = getEmojisForVibe(vibe);
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            name = `${emoji} ${name} ${emoji}`;
        }

        results.push(name);
    }

    return results;
}

function getEmojisForVibe(vibe: Vibe): string[] {
    switch (vibe) {
        case 'sad': return ['💔', '🌧️', '🥀', '🌑', '💧'];
        case 'hype': return ['🔥', '⚡', '🚀', '💯', '🆙'];
        case 'chill': return ['☁️', '☕', '🌿', '🌙', '🧸'];
        case 'love': return ['❤️', '💘', '🧸', '💌', '🌹'];
        case 'party': return ['🎉', '🪩', '🥂', '🔊', '🕺'];
        case 'workout': return ['💪', '🏋️', '🏃', '🔥', '🥊'];
        case 'focus': return ['🧠', '📚', '🎧', '⚡', '📓'];
        case 'travel': return ['✈️', '🚗', '🌍', '🌴', '🗺️'];
        default: return ['🎵'];
    }
}
