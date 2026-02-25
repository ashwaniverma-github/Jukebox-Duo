// Pre-seeded song dataset for the Higher or Lower game
// View counts are approximate, sourced from YouTube (as of early 2026)
// Thumbnails are loaded via: https://img.youtube.com/vi/{videoId}/mqdefault.jpg

export interface SongData {
    title: string;
    artist: string;
    videoId: string;
    views: number; // raw view count
    year?: number;
}

export const songsDatabase: SongData[] = [
    // === MEGA HITS (5B+) ===
    { title: "Baby Shark Dance", artist: "Pinkfong", videoId: "XqZsoesa55w", views: 14900000000, year: 2016 },
    { title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", videoId: "kJQP7kiw5Fk", views: 8400000000, year: 2017 },
    { title: "Johny Johny Yes Papa", artist: "LooLoo Kids", videoId: "F4tHL8reNCs", views: 6800000000, year: 2016 },
    { title: "Shape of You", artist: "Ed Sheeran", videoId: "JGwWNGJdvx8", views: 6300000000, year: 2017 },
    { title: "See You Again", artist: "Wiz Khalifa ft. Charlie Puth", videoId: "RgKAFK5djSk", views: 6100000000, year: 2015 },
    { title: "Bath Song", artist: "Cocomelon", videoId: "WRVsOCh907o", views: 5900000000, year: 2018 },
    { title: "Phonics Song with Two Words", artist: "ChuChu TV", videoId: "_UR-l3QI2nE", views: 5600000000, year: 2014 },
    { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", videoId: "OPf0YbXqDm0", views: 5100000000, year: 2014 },
    { title: "Gangnam Style", artist: "PSY", videoId: "9bZkp7q19f0", views: 5000000000, year: 2012 },
    { title: "Learning Colors", artist: "Miroshka TV", videoId: "bVTbCIr9bGo", views: 5000000000, year: 2018 },

    // === GLOBAL POP (2B-5B) ===
    { title: "Sugar", artist: "Maroon 5", videoId: "09R8_2nJtjg", views: 4200000000, year: 2015 },
    { title: "Sorry", artist: "Justin Bieber", videoId: "fRh_vgS2dFE", views: 3800000000, year: 2015 },
    { title: "Counting Stars", artist: "OneRepublic", videoId: "hT_nvWreIhg", views: 3900000000, year: 2013 },
    { title: "Roar", artist: "Katy Perry", videoId: "CevxZvSJLk8", views: 3700000000, year: 2013 },
    { title: "Dark Horse", artist: "Katy Perry ft. Juicy J", videoId: "0KSOMA3QBU0", views: 3500000000, year: 2014 },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", videoId: "lp-EO5I60KA", views: 3500000000, year: 2014 },
    { title: "Faded", artist: "Alan Walker", videoId: "60ItHLz5WEA", views: 3400000000, year: 2015 },
    { title: "Lean On", artist: "Major Lazer & DJ Snake ft. MØ", videoId: "YqeW9_5kURI", views: 3400000000, year: 2015 },
    { title: "Hello", artist: "Adele", videoId: "YQHsXMglC9A", views: 3200000000, year: 2015 },
    { title: "Shake It Off", artist: "Taylor Swift", videoId: "nfWlot6h_JM", views: 3500000000, year: 2014 },
    { title: "Blank Space", artist: "Taylor Swift", videoId: "e-ORhEE9VVg", views: 3200000000, year: 2014 },
    { title: "Waka Waka", artist: "Shakira", videoId: "pRpeEdMmmQ0", views: 3500000000, year: 2010 },
    { title: "Let Her Go", artist: "Passenger", videoId: "RBumgq5yVrA", views: 3400000000, year: 2012 },
    { title: "Closer", artist: "The Chainsmokers ft. Halsey", videoId: "PT2_F-1esPk", views: 3100000000, year: 2016 },
    { title: "Something Just Like This", artist: "The Chainsmokers & Coldplay", videoId: "FM7MFYoylVs", views: 2900000000, year: 2017 },
    { title: "Girls Like You", artist: "Maroon 5 ft. Cardi B", videoId: "aJOTlE1K90k", views: 3600000000, year: 2018 },
    { title: "Perfect", artist: "Ed Sheeran", videoId: "2Vv-BfVoq4g", views: 3300000000, year: 2017 },
    { title: "Havana", artist: "Camila Cabello ft. Young Thug", videoId: "BQ0mxQXmLsk", views: 2500000000, year: 2017 },
    { title: "Photograph", artist: "Ed Sheeran", videoId: "nSDgHBxUbVQ", views: 2900000000, year: 2015 },
    { title: "Love Yourself", artist: "Justin Bieber", videoId: "oyEuk8j8imI", views: 2700000000, year: 2015 },
    { title: "All of Me", artist: "John Legend", videoId: "450p7goxZqg", views: 2600000000, year: 2013 },
    { title: "Wrecking Ball", artist: "Miley Cyrus", videoId: "My2FRPA3Gf8", views: 2200000000, year: 2013 },
    { title: "Stay", artist: "The Kid LAROI & Justin Bieber", videoId: "kTJczUoc26U", views: 2100000000, year: 2021 },
    { title: "Sunflower", artist: "Post Malone & Swae Lee", videoId: "ApXoWvfEYVU", views: 2300000000, year: 2018 },
    { title: "Rolling in the Deep", artist: "Adele", videoId: "rYEDA3JcQqw", views: 2500000000, year: 2010 },
    { title: "Someone Like You", artist: "Adele", videoId: "hLQl3WQQoQ0", views: 2000000000, year: 2011 },
    { title: "Thunder", artist: "Imagine Dragons", videoId: "fKopy74weus", views: 2200000000, year: 2017 },
    { title: "Believer", artist: "Imagine Dragons", videoId: "7wtfhZwyrcc", views: 2400000000, year: 2017 },
    { title: "Radioactive", artist: "Imagine Dragons", videoId: "ktvTqknDobU", views: 2000000000, year: 2012 },
    { title: "Bad Guy", artist: "Billie Eilish", videoId: "DyDfgMOUjCI", views: 2200000000, year: 2019 },

    // === LATIN / REGGAETON (1B-4B) ===
    { title: "Mi Gente", artist: "J Balvin & Willy William", videoId: "wnJ6LuUFpMo", views: 3200000000, year: 2017 },
    { title: "Bailando", artist: "Enrique Iglesias ft. Descemer Bueno", videoId: "NUsoVlDFqZg", views: 3200000000, year: 2014 },
    { title: "Dura", artist: "Daddy Yankee", videoId: "Q10Tlnx9gC4", views: 2500000000, year: 2018 },
    { title: "Te Boté", artist: "Casper Mágico, Nio García, Bad Bunny", videoId: "9jK-NcRmVcw", views: 2300000000, year: 2018 },
    { title: "Taki Taki", artist: "DJ Snake ft. Selena Gomez, Ozuna, Cardi B", videoId: "ixkoVwKQaJg", views: 2200000000, year: 2018 },
    { title: "Con Calma", artist: "Daddy Yankee & Snow", videoId: "DiItGE3eAyQ", views: 2300000000, year: 2019 },
    { title: "X (EQUIS)", artist: "Nicky Jam x J Balvin", videoId: "_I_D_8Z4sJE", views: 2100000000, year: 2018 },
    { title: "La Bicicleta", artist: "Carlos Vives & Shakira", videoId: "FKsNaQoSXRM", views: 1800000000, year: 2016 },
    { title: "Felices los 4", artist: "Maluma", videoId: "t_jHrUE5IOk", views: 1900000000, year: 2017 },
    { title: "El Perdón", artist: "Nicky Jam & Enrique Iglesias", videoId: "kLaBrcRn4fk", views: 1700000000, year: 2015 },
    { title: "Chantaje", artist: "Shakira ft. Maluma", videoId: "6Mgqbai3fKo", views: 2100000000, year: 2016 },
    { title: "Calma", artist: "Pedro Capó & Farruko", videoId: "1_zgKRBrT0Y", views: 1600000000, year: 2018 },

    // === BOLLYWOOD / INDIAN ===
    { title: "Laung Laachi", artist: "Mannat Noor", videoId: "wEe-5NqmADw", views: 2100000000, year: 2018 },
    { title: "Vaaste", artist: "Dhvani Bhanushali", videoId: "3Uo0JAUWijM", views: 1700000000, year: 2019 },
    { title: "Lut Gaye", artist: "Jubin Nautiyal", videoId: "sCbbMZ-q4-I", views: 1500000000, year: 2021 },
    { title: "Tera Ban Jaunga", artist: "Akhil Sachdeva & Tulsi Kumar", videoId: "bH89OX8Fcpg", views: 1200000000, year: 2019 },
    { title: "Tere Vaste", artist: "Arijit Singh", videoId: "c3aYuB0f06U", views: 1100000000, year: 2023 },
    { title: "Raataan Lambiyan", artist: "Jubin Nautiyal & Asees Kaur", videoId: "gvyUuxdRdR4", views: 1100000000, year: 2021 },
    { title: "Kesariya", artist: "Arijit Singh", videoId: "BddP6PYo2gs", views: 900000000, year: 2022 },
    { title: "Tum Hi Ho", artist: "Arijit Singh", videoId: "IJq0yyWug1k", views: 1200000000, year: 2013 },
    { title: "Tera Hone Laga Hoon", artist: "Atif Aslam & Alisha Chinai", videoId: "pyRPDcROJ8k", views: 800000000, year: 2009 },
    { title: "JHOOME JO PATHAAN", artist: "Arijit Singh", videoId: "baaXaREMbhI", views: 880000000, year: 2023 },
    { title: "Naatu Naatu", artist: "Rahul Sipligunj & Kaala Bhairava", videoId: "OsU0CGZoV8E", views: 540000000, year: 2022 },
    { title: "Apna Bana Le", artist: "Arijit Singh", videoId: "LEkTSGmrp_M", views: 700000000, year: 2023 },
    { title: "Pasoori", artist: "Ali Sethi x Shae Gill", videoId: "5Eqb_-j3FDA", views: 700000000, year: 2022 },
    { title: "Excuses", artist: "AP Dhillon & Gurinder Gill", videoId: "vCeqih6OEJI", views: 600000000, year: 2021 },

    // === K-POP ===
    { title: "Boy With Luv", artist: "BTS ft. Halsey", videoId: "XsX3ATc3FbA", views: 1600000000, year: 2019 },
    { title: "DDU-DU DDU-DU", artist: "BLACKPINK", videoId: "IHNzOHi8sJs", views: 2200000000, year: 2018 },
    { title: "How You Like That", artist: "BLACKPINK", videoId: "ioNng23DkIM", views: 1400000000, year: 2020 },
    { title: "Kill This Love", artist: "BLACKPINK", videoId: "2S24-y0Ij3Y", views: 1700000000, year: 2019 },
    { title: "DNA", artist: "BTS", videoId: "MBdVXkSdhwU", views: 1600000000, year: 2017 },
    { title: "Dynamite", artist: "BTS", videoId: "gdZLi9oWNZg", views: 1800000000, year: 2020 },
    { title: "IDOL", artist: "BTS ft. Nicki Minaj", videoId: "pBuZEGYXA6E", views: 1300000000, year: 2018 },
    { title: "BOOMBAYAH", artist: "BLACKPINK", videoId: "bwmSjveL3Lc", views: 1700000000, year: 2016 },
    { title: "Lovesick Girls", artist: "BLACKPINK", videoId: "dyRsYk0LyA8", views: 900000000, year: 2020 },
    { title: "Butter", artist: "BTS", videoId: "WMweEpGlu_U", views: 1000000000, year: 2021 },
    { title: "Pink Venom", artist: "BLACKPINK", videoId: "gQlMMD8auMs", views: 800000000, year: 2022 },
    { title: "APT.", artist: "ROSÉ & Bruno Mars", videoId: "ekr2nIex040", views: 900000000, year: 2024 },
    { title: "FLOWER", artist: "JISOO", videoId: "jYIDNBKdfho", views: 600000000, year: 2023 },
    { title: "Super Shy", artist: "NewJeans", videoId: "ArmDp-zijuc", views: 500000000, year: 2023 },
    { title: "ANTIFRAGILE", artist: "LE SSERAFIM", videoId: "pyf8cbqyfPs", views: 400000000, year: 2022 },
    { title: "Cupid", artist: "FIFTY FIFTY", videoId: "Qc7_zRjH808", views: 570000000, year: 2023 },

    // === HIP-HOP / RAP ===
    { title: "God's Plan", artist: "Drake", videoId: "xpVfcZ0ZcFM", views: 1700000000, year: 2018 },
    { title: "Rockstar", artist: "Post Malone ft. 21 Savage", videoId: "UceaB4D0jpo", views: 1300000000, year: 2017 },
    { title: "Lucid Dreams", artist: "Juice WRLD", videoId: "mzB1VGEGcSU", views: 1400000000, year: 2018 },
    { title: "HUMBLE.", artist: "Kendrick Lamar", videoId: "tvTRZJ-4EyI", views: 900000000, year: 2017 },
    { title: "SICKO MODE", artist: "Travis Scott", videoId: "6ONRf7h3Mdk", views: 900000000, year: 2018 },
    { title: "Congratulations", artist: "Post Malone ft. Quavo", videoId: "SC4xMk98Pdc", views: 1200000000, year: 2017 },
    { title: "Wow.", artist: "Post Malone", videoId: "393C3pr2ioY", views: 700000000, year: 2019 },
    { title: "Circles", artist: "Post Malone", videoId: "wXhTHyIgQ_U", views: 900000000, year: 2019 },
    { title: "RAPSTAR", artist: "Polo G", videoId: "3LiRiFT-fQM", views: 500000000, year: 2021 },
    { title: "Laugh Now Cry Later", artist: "Drake ft. Lil Durk", videoId: "JFm7YDVlqnI", views: 600000000, year: 2020 },
    { title: "MONTERO", artist: "Lil Nas X", videoId: "6swmTBVI83k", views: 700000000, year: 2021 },
    { title: "Old Town Road", artist: "Lil Nas X ft. Billy Ray Cyrus", videoId: "w2Ov5jzm3j8", views: 900000000, year: 2019 },
    { title: "WAP", artist: "Cardi B ft. Megan Thee Stallion", videoId: "hsm4poTWjMs", views: 600000000, year: 2020 },
    { title: "Savage Love", artist: "Jawsh 685 & Jason Derulo", videoId: "gUci-tsiU4I", views: 700000000, year: 2020 },
    { title: "Blinding Lights", artist: "The Weeknd", videoId: "4NRXx6U8ABQ", views: 1000000000, year: 2020 },
    { title: "Starboy", artist: "The Weeknd ft. Daft Punk", videoId: "34Na4j8AVgA", views: 1300000000, year: 2016 },
    { title: "The Hills", artist: "The Weeknd", videoId: "yzTuBuRdAyA", views: 800000000, year: 2015 },
    { title: "Mask Off", artist: "Future", videoId: "xvZqHgFz51I", views: 800000000, year: 2017 },

    // === POP / DANCE ===
    { title: "Attention", artist: "Charlie Puth", videoId: "nfs8NYg7yQM", views: 1600000000, year: 2017 },
    { title: "Señorita", artist: "Shawn Mendes & Camila Cabello", videoId: "Pkh8UtuejGw", views: 2000000000, year: 2019 },
    { title: "Stitches", artist: "Shawn Mendes", videoId: "VbfpW0pbvaU", views: 1200000000, year: 2015 },
    { title: "Treat You Better", artist: "Shawn Mendes", videoId: "lY2yjAdbvdQ", views: 1100000000, year: 2016 },
    { title: "7 Years", artist: "Lukas Graham", videoId: "LHCob76kigA", views: 1300000000, year: 2015 },
    { title: "Shallow", artist: "Lady Gaga & Bradley Cooper", videoId: "bo_efYhYU2A", views: 1200000000, year: 2018 },
    { title: "Dance Monkey", artist: "Tones and I", videoId: "q0hyYWKXF0Q", views: 1800000000, year: 2019 },
    { title: "Someone You Loved", artist: "Lewis Capaldi", videoId: "zABLecsR5UE", views: 900000000, year: 2019 },
    { title: "Happier", artist: "Marshmello ft. Bastille", videoId: "m7Bc3pLyij0", views: 1200000000, year: 2018 },
    { title: "Stressed Out", artist: "Twenty One Pilots", videoId: "pXRviuL6vMY", views: 2100000000, year: 2015 },
    { title: "Heathens", artist: "Twenty One Pilots", videoId: "UprcpdwuwCg", views: 1400000000, year: 2016 },
    { title: "lovely", artist: "Billie Eilish & Khalid", videoId: "V1Pl8CzNzCw", views: 1200000000, year: 2018 },
    { title: "bad guy", artist: "Billie Eilish", videoId: "DyDfgMOUjCI", views: 2200000000, year: 2019 },
    { title: "Cheap Thrills", artist: "Sia ft. Sean Paul", videoId: "nYh-n7EOtMA", views: 2600000000, year: 2016 },
    { title: "Chandelier", artist: "Sia", videoId: "2vjPBrBU-TM", views: 2500000000, year: 2014 },
    { title: "Elastic Heart", artist: "Sia ft. Shia LaBeouf & Maddie Ziegler", videoId: "KWZGAExj-es", views: 1200000000, year: 2015 },
    { title: "Wolves", artist: "Selena Gomez & Marshmello", videoId: "cH4E_t3m3xM", views: 900000000, year: 2017 },
    { title: "Kill Bill", artist: "SZA", videoId: "hIQHxruMmWY", views: 500000000, year: 2022 },
    { title: "Anti-Hero", artist: "Taylor Swift", videoId: "b1kbLwvqugk", views: 500000000, year: 2022 },
    { title: "Cruel Summer", artist: "Taylor Swift", videoId: "ic8j13piAhQ", views: 400000000, year: 2023 },
    { title: "As It Was", artist: "Harry Styles", videoId: "H5v3kku4y6Q", views: 1200000000, year: 2022 },
    { title: "Watermelon Sugar", artist: "Harry Styles", videoId: "E07s5ZYadZw", views: 900000000, year: 2020 },
    { title: "Flowers", artist: "Miley Cyrus", videoId: "G7KNmW9a75Y", views: 1300000000, year: 2023 },
    { title: "Vampire", artist: "Olivia Rodrigo", videoId: "RlPNh_PBZb4", views: 400000000, year: 2023 },
    { title: "drivers license", artist: "Olivia Rodrigo", videoId: "ZmDBbnmKpqQ", views: 600000000, year: 2021 },
    { title: "good 4 u", artist: "Olivia Rodrigo", videoId: "gNi_6U5Pm_o", views: 500000000, year: 2021 },
    { title: "Levitating", artist: "Dua Lipa", videoId: "TUVcZfQe-Kw", views: 800000000, year: 2020 },
    { title: "Don't Start Now", artist: "Dua Lipa", videoId: "oygrmJFKYZY", views: 900000000, year: 2019 },
    { title: "New Rules", artist: "Dua Lipa", videoId: "k2qgadSvNyU", views: 2600000000, year: 2017 },
    { title: "One Kiss", artist: "Calvin Harris & Dua Lipa", videoId: "DkeiKbqa02I", views: 900000000, year: 2018 },
    { title: "This Is What You Came For", artist: "Calvin Harris ft. Rihanna", videoId: "kOkQ4T5WO9E", views: 1400000000, year: 2016 },
    { title: "We Don't Talk Anymore", artist: "Charlie Puth ft. Selena Gomez", videoId: "3AtDnEC4zak", views: 1400000000, year: 2016 },
    { title: "Without Me", artist: "Halsey", videoId: "ZAfAud_M_mg", views: 800000000, year: 2018 },
    { title: "Senorita", artist: "Shawn Mendes & Camila Cabello", videoId: "Pkh8UtuejGw", views: 2000000000, year: 2019 },

    // === CLASSIC / ROCK / OLDER HITS ===
    { title: "Bohemian Rhapsody", artist: "Queen", videoId: "fJ9rUzIMcZQ", views: 1700000000, year: 1975 },
    { title: "Take On Me", artist: "a-ha", videoId: "djV11Xbc914", views: 1600000000, year: 1985 },
    { title: "Numb", artist: "Linkin Park", videoId: "kXYiU_JCYtU", views: 1900000000, year: 2003 },
    { title: "In The End", artist: "Linkin Park", videoId: "eVTXPUF4Oz4", views: 1700000000, year: 2000 },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", videoId: "hTWKbfoikeg", views: 1700000000, year: 1991 },
    { title: "Zombie", artist: "The Cranberries", videoId: "6Ejga4kJUts", views: 1400000000, year: 1994 },
    { title: "Hotel California", artist: "Eagles", videoId: "BciS5krYL80", views: 700000000, year: 1977 },
    { title: "Stairway to Heaven", artist: "Led Zeppelin", videoId: "QkF3oxziUI4", views: 300000000, year: 1971 },
    { title: "Sweet Child O' Mine", artist: "Guns N' Roses", videoId: "1w7OgIMMRc4", views: 1200000000, year: 1988 },
    { title: "November Rain", artist: "Guns N' Roses", videoId: "8SbUC-UaAxE", views: 1900000000, year: 1992 },
    { title: "The Scientist", artist: "Coldplay", videoId: "RB-RcX5DS5A", views: 800000000, year: 2002 },
    { title: "Fix You", artist: "Coldplay", videoId: "k4V3Mo61fJM", views: 900000000, year: 2005 },
    { title: "Viva La Vida", artist: "Coldplay", videoId: "dvgZkm1xWPE", views: 700000000, year: 2008 },
    { title: "Hymn for the Weekend", artist: "Coldplay", videoId: "YykjpeuMNEk", views: 1400000000, year: 2016 },
    { title: "Lose Yourself", artist: "Eminem", videoId: "_Yhyp-_hX2s", views: 1300000000, year: 2002 },
    { title: "Love The Way You Lie", artist: "Eminem ft. Rihanna", videoId: "uelHwf8o7_U", views: 2300000000, year: 2010 },
    { title: "Not Afraid", artist: "Eminem", videoId: "j5-yKhDd64s", views: 1500000000, year: 2010 },
    { title: "Rap God", artist: "Eminem", videoId: "XbGs_qK2PQA", views: 1500000000, year: 2013 },
    { title: "Mockingbird", artist: "Eminem", videoId: "S9bCLPwzSC0", views: 1100000000, year: 2004 },
    { title: "River", artist: "Eminem ft. Ed Sheeran", videoId: "AqhiTsu2wBQ", views: 800000000, year: 2017 },
    { title: "Somebody That I Used to Know", artist: "Gotye ft. Kimbra", videoId: "8UVNT4wvIGY", views: 1800000000, year: 2011 },
    { title: "Let It Go", artist: "Idina Menzel", videoId: "moSFlvxnbgk", views: 1400000000, year: 2013 },

    // === EDM / ELECTRONIC ===
    { title: "Alone", artist: "Marshmello", videoId: "ALZHF5UqnU4", views: 1600000000, year: 2016 },
    { title: "Titanium", artist: "David Guetta ft. Sia", videoId: "JRfuAukYTKg", views: 1500000000, year: 2011 },
    { title: "Wake Me Up", artist: "Avicii", videoId: "IcrbM1l_BoI", views: 2100000000, year: 2013 },
    { title: "Levels", artist: "Avicii", videoId: "_ovdm2yX4MA", views: 600000000, year: 2011 },
    { title: "Waiting for Love", artist: "Avicii", videoId: "cHHLHGNpCSA", views: 800000000, year: 2015 },
    { title: "The Nights", artist: "Avicii", videoId: "UtF6Jej8yb4", views: 600000000, year: 2014 },
    { title: "Roses", artist: "SAINt JHN (Imanbek Remix)", videoId: "ele2DMU49Jk", views: 800000000, year: 2019 },
    { title: "Silence", artist: "Marshmello ft. Khalid", videoId: "Tx1sqYlKOBQ", views: 600000000, year: 2017 },
    { title: "Don't Let Me Down", artist: "The Chainsmokers ft. Daya", videoId: "Io0fBr1XBUA", views: 1000000000, year: 2016 },
    { title: "This Is Love", artist: "will.i.am ft. Eva Simons", videoId: "pa14VNsdSYM", views: 400000000, year: 2012 },
    { title: "Where Are Ü Now", artist: "Skrillex & Diplo ft. Justin Bieber", videoId: "nntGTK2Fhb0", views: 500000000, year: 2015 },
    { title: "Clarity", artist: "Zedd ft. Foxes", videoId: "IxxstCcJlsc", views: 600000000, year: 2012 },
    { title: "Animals", artist: "Martin Garrix", videoId: "gCYcHz2k5x0", views: 1500000000, year: 2013 },
    { title: "Turn Down for What", artist: "DJ Snake & Lil Jon", videoId: "HMUDVMiITOU", views: 1100000000, year: 2013 },

    // === R&B / SOUL ===
    { title: "Earned It", artist: "The Weeknd", videoId: "waU75jdUnYw", views: 900000000, year: 2014 },
    { title: "Call Out My Name", artist: "The Weeknd", videoId: "M4ZoCHID9GI", views: 700000000, year: 2018 },
    { title: "Save Your Tears", artist: "The Weeknd", videoId: "XXYlFuWEuKI", views: 800000000, year: 2020 },
    { title: "Peaches", artist: "Justin Bieber ft. Daniel Caesar", videoId: "tQ0yjYUFKAE", views: 600000000, year: 2021 },
    { title: "Yummy", artist: "Justin Bieber", videoId: "8EJ3zbKTWQ8", views: 700000000, year: 2020 },
    { title: "What Do You Mean?", artist: "Justin Bieber", videoId: "DK_0jXPuIr0", views: 1600000000, year: 2015 },
    { title: "Baby", artist: "Justin Bieber ft. Ludacris", videoId: "kffacxfA7G4", views: 3100000000, year: 2010 },
    { title: "Runaway", artist: "Aurora", videoId: "d_HlPboLRL8", views: 400000000, year: 2015 },
    { title: "Say You Won't Let Go", artist: "James Arthur", videoId: "0yW7w8F2TVA", views: 1400000000, year: 2016 },
    { title: "Memories", artist: "Maroon 5", videoId: "SlPhMPnQ58k", views: 1300000000, year: 2019 },

    // === MORE GLOBAL HITS ===
    { title: "Believer", artist: "Imagine Dragons", videoId: "7wtfhZwyrcc", views: 2400000000, year: 2017 },
    { title: "Happier Than Ever", artist: "Billie Eilish", videoId: "5GJWxDKyk3A", views: 400000000, year: 2021 },
    { title: "Levitating", artist: "Dua Lipa ft. DaBaby", videoId: "WHuBW3qKm9g", views: 400000000, year: 2020 },
    { title: "Savage", artist: "Megan Thee Stallion ft. Beyoncé", videoId: "dIOH-mCiMfE", views: 350000000, year: 2020 },
    { title: "Rain On Me", artist: "Lady Gaga & Ariana Grande", videoId: "AoAm4om0wTs", views: 400000000, year: 2020 },
    { title: "positions", artist: "Ariana Grande", videoId: "tcYodQoapMg", views: 700000000, year: 2020 },
    { title: "7 rings", artist: "Ariana Grande", videoId: "QYh6mYIJG2Y", views: 1100000000, year: 2019 },
    { title: "thank u, next", artist: "Ariana Grande", videoId: "gl1aHhXnN1k", views: 1700000000, year: 2018 },
    { title: "no tears left to cry", artist: "Ariana Grande", videoId: "ffxKSjUwKdU", views: 900000000, year: 2018 },
    { title: "Side to Side", artist: "Ariana Grande ft. Nicki Minaj", videoId: "SXiSVQZLje8", views: 1200000000, year: 2016 },
    { title: "Problem", artist: "Ariana Grande ft. Iggy Azalea", videoId: "iS1g8G_njx8", views: 900000000, year: 2014 },
    { title: "Bang Bang", artist: "Jessie J, Ariana Grande, Nicki Minaj", videoId: "0HDdjwpPM3Y", views: 1300000000, year: 2014 },
    { title: "Anaconda", artist: "Nicki Minaj", videoId: "LDZX4ooRsWs", views: 1100000000, year: 2014 },
    { title: "Super Bass", artist: "Nicki Minaj", videoId: "4JipHEz53sU", views: 1000000000, year: 2011 },

    // === 2023-2024 HITS ===
    { title: "Calm Down", artist: "Rema & Selena Gomez", videoId: "WcIcVapfqXw", views: 1100000000, year: 2022 },
    { title: "Unholy", artist: "Sam Smith & Kim Petras", videoId: "Uq9gPaIzbe8", views: 600000000, year: 2022 },
    { title: "Under the Influence", artist: "Chris Brown", videoId: "1BDs44vsFpE", views: 600000000, year: 2022 },
    { title: "Creepin'", artist: "Metro Boomin, The Weeknd & 21 Savage", videoId: "6FhJA4gHH18", views: 400000000, year: 2022 },
    { title: "Snooze", artist: "SZA", videoId: "LViCaGBmaxI", views: 350000000, year: 2022 },
    { title: "LALA", artist: "Myke Towers", videoId: "8MjnmHFkd_E", views: 700000000, year: 2022 },
    { title: "Last Night", artist: "Morgan Wallen", videoId: "TnJ0ovcaQgY", views: 400000000, year: 2023 },
    { title: "Paint The Town Red", artist: "Doja Cat", videoId: "bMUFlFxQbWE", views: 500000000, year: 2023 },
    { title: "Greedy", artist: "Tate McRae", videoId: "8SSXM0y2EvA", views: 400000000, year: 2023 },
    { title: "Water", artist: "Tyla", videoId: "KLOqiscTSVQ", views: 400000000, year: 2023 },
    { title: "Espresso", artist: "Sabrina Carpenter", videoId: "eVli-tstM5E", views: 500000000, year: 2024 },
    { title: "Birds of a Feather", artist: "Billie Eilish", videoId: "x6u56Mpo-VI", views: 350000000, year: 2024 },
    { title: "Beautiful Things", artist: "Benson Boone", videoId: "Eo5X0P_8whU", views: 500000000, year: 2024 },
    { title: "Gata Only", artist: "FloyyMenor & Cris MJ", videoId: "oCNoiJ3FLXY", views: 1000000000, year: 2023 },
    { title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", videoId: "kPa7bsKwL-c", views: 800000000, year: 2024 },
    { title: "Taste", artist: "Sabrina Carpenter", videoId: "gy14KrqkmPU", views: 350000000, year: 2024 },

    // === THROWBACKS (2000s-2010s) ===
    { title: "Payphone", artist: "Maroon 5 ft. Wiz Khalifa", videoId: "KRaWnd3LJfs", views: 1200000000, year: 2012 },
    { title: "Moves Like Jagger", artist: "Maroon 5 ft. Christina Aguilera", videoId: "iEPTlhBmwRg", views: 1100000000, year: 2011 },
    { title: "Maps", artist: "Maroon 5", videoId: "piKJ8n65r40", views: 800000000, year: 2014 },
    { title: "All About That Bass", artist: "Meghan Trainor", videoId: "7PCkvCPvDXk", views: 1000000000, year: 2014 },
    { title: "Timber", artist: "Pitbull ft. Ke$ha", videoId: "hHUbLv4ThOo", views: 1300000000, year: 2013 },
    { title: "On The Floor", artist: "Jennifer Lopez ft. Pitbull", videoId: "t4H_Zoh7G5A", views: 1100000000, year: 2011 },
    { title: "Just The Way You Are", artist: "Bruno Mars", videoId: "LjhCEhWiKXk", views: 1400000000, year: 2010 },
    { title: "Grenade", artist: "Bruno Mars", videoId: "SR6iYWJxHqs", views: 1100000000, year: 2010 },
    { title: "24K Magic", artist: "Bruno Mars", videoId: "UqyT8IEBkvY", views: 1100000000, year: 2016 },
    { title: "That's What I Like", artist: "Bruno Mars", videoId: "PMivT7MJ41M", views: 700000000, year: 2017 },
    { title: "Locked Out of Heaven", artist: "Bruno Mars", videoId: "e-fA-gBCkj0", views: 900000000, year: 2012 },
    { title: "We Found Love", artist: "Rihanna ft. Calvin Harris", videoId: "tg00YEETFzg", views: 1000000000, year: 2011 },
    { title: "Diamonds", artist: "Rihanna", videoId: "lWA2pjMjpBs", views: 1400000000, year: 2012 },
    { title: "Stay", artist: "Rihanna ft. Mikky Ekko", videoId: "JF8BRvqGCNs", views: 800000000, year: 2013 },
    { title: "Work", artist: "Rihanna ft. Drake", videoId: "HL1UzIK-flA", views: 1000000000, year: 2016 },
    { title: "Umbrella", artist: "Rihanna ft. JAY-Z", videoId: "CvBfHwUxHIk", views: 800000000, year: 2007 },
    { title: "We Are Young", artist: "fun. ft. Janelle Monáe", videoId: "Sv6dMFF_yts", views: 600000000, year: 2012 },
    { title: "Pompeii", artist: "Bastille", videoId: "F90Cw4l-8NY", views: 700000000, year: 2013 },
    { title: "Ride", artist: "Twenty One Pilots", videoId: "Pw-0pbY9JeU", views: 900000000, year: 2015 },
    { title: "It's My Life", artist: "Bon Jovi", videoId: "vx2u5uUu3DE", views: 800000000, year: 2000 },
    { title: "Livin' on a Prayer", artist: "Bon Jovi", videoId: "lDK9QqIzhwk", views: 500000000, year: 1986 },
    { title: "I Gotta Feeling", artist: "Black Eyed Peas", videoId: "uSD4vsh1zDA", views: 500000000, year: 2009 },
    { title: "Party Rock Anthem", artist: "LMFAO ft. Lauren Bennett", videoId: "KQ6zr6kCPj8", views: 1100000000, year: 2011 },
    { title: "Applause", artist: "Lady Gaga", videoId: "pco91kroVgQ", views: 400000000, year: 2013 },
    { title: "Born This Way", artist: "Lady Gaga", videoId: "wV1FrqwZyKw", views: 500000000, year: 2011 },
    { title: "Bad Romance", artist: "Lady Gaga", videoId: "qrO4YZeyl0I", views: 1600000000, year: 2009 },
    { title: "Poker Face", artist: "Lady Gaga", videoId: "bESGLojNYSo", views: 900000000, year: 2008 },
];

// Remove duplicates by videoId (keep first occurrence)
const seen = new Set<string>();
export const songs: SongData[] = songsDatabase.filter(song => {
    if (seen.has(song.videoId)) return false;
    seen.add(song.videoId);
    return true;
});

// Utility: Format view count for display
export function formatViews(views: number): string {
    if (views >= 1_000_000_000) {
        const b = views / 1_000_000_000;
        return b % 1 === 0 ? `${b}B` : `${b.toFixed(1)}B`;
    }
    if (views >= 1_000_000) {
        const m = views / 1_000_000;
        return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
    }
    if (views >= 1_000) {
        const k = views / 1_000;
        return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
    }
    return views.toString();
}

// Get thumbnail URL for a song
export function getThumbnailUrl(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// Get two random songs that are different AND have strictly different view counts (no ties)
export function getRandomPair(): [SongData, SongData] {
    if (songs.length < 2) {
        throw new Error(`getRandomPair requires at least 2 songs; got ${songs.length}`);
    }
    let a: SongData, b: SongData;
    let attempts = 0;
    do {
        const idxA = Math.floor(Math.random() * songs.length);
        let idxB = Math.floor(Math.random() * songs.length);
        while (idxB === idxA) {
            idxB = Math.floor(Math.random() * songs.length);
        }
        a = songs[idxA];
        b = songs[idxB];
        attempts++;
        // Safety valve: after 50 attempts just return whatever we have
        if (attempts > 50) break;
    } while (a.views === b.views);
    return [a, b];
}

// Get a single random song (different videoId AND preferably different view count)
export function getRandomSong(excludeVideoId: string): SongData {
    const excludeSong = songs.find(s => s.videoId === excludeVideoId);
    // First pass: exclude same videoId AND same view count (no tie)
    let candidates = songs.filter(s =>
        s.videoId !== excludeVideoId &&
        !(excludeSong && s.views === excludeSong.views)
    );
    // Fallback: if strict filter yields nothing, only exclude by videoId
    if (candidates.length === 0) {
        candidates = songs.filter(s => s.videoId !== excludeVideoId);
    }
    if (candidates.length === 0) {
        throw new Error(`getRandomSong: no songs available after excluding "${excludeVideoId}"`);
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
}
