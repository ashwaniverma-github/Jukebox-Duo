import Redis from 'ioredis';

// Stopwords stripped from queries to collapse semantically-equivalent searches
// into a single cache entry (e.g. "arijit singh songs" == "best arijit singh").
const QUERY_STOPWORDS = new Set([
  'songs', 'song', 'music', 'best', 'top', 'new', 'latest', 'old',
  'all', 'of', 'by', 'the', 'a', 'an', 'video', 'videos', 'hits',
  'full', 'official', 'hd', 'remix', 'lyrics',
  '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'
]);

/**
 * Canonicalize a user query into a stable cache key.
 * Strips punctuation, lowercases, removes stopwords, dedupes, alphabetizes.
 * "arijit singh songs", "best arijit singh", "arijit singh new hits" → "arijit singh"
 */
export function canonicalizeQuery(query: string): string {
  const tokens = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w && !QUERY_STOPWORDS.has(w));
  return Array.from(new Set(tokens)).sort().join(' ');
}

interface CachedSearchResult {
  query: string;
  results: Array<{
    videoId: string;
    title: string;
    thumbnail: string;
    duration?: string;
    channelTitle?: string;
  }>;
  timestamp: number;
  expiresAt: number;
}

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  duration?: string;
  channelTitle?: string;
}

class CacheService {
  private redis: Redis.Redis | null = null;
  private readonly CACHE_TTL = 30 * 24 * 60 * 60; // 30 days — max allowed by YouTube ToS
  private readonly SEARCH_CACHE_PREFIX = 'youtube_search:';
  private readonly PLAYLIST_CACHE_PREFIX = 'youtube_playlist:';
  private readonly PLAYLIST_CACHE_TTL = 30 * 24 * 60 * 60; // 30 days — playlists barely change

  constructor() {
    console.log('🔍 CacheService constructor - checking env vars:');
    if (process.env.REDIS_URL) {
      console.log('REDIS_URL: rediss://***@***.upstash.io:6379');
    } else {
      console.log('REDIS_HOST:', process.env.REDIS_HOST);
      console.log('REDIS_PORT:', process.env.REDIS_PORT);
      console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***' : 'undefined');
      console.log('REDIS_TLS:', process.env.REDIS_TLS);
    }

    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        console.log('🔧 Using REDIS_URL for connection');
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000,
          commandTimeout: 5000
        });
      } else {
        console.log('🔧 Using separate env vars for connection');
        this.redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
          tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000,
          commandTimeout: 5000
        });
      }

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully!');
      });

      this.redis.on('ready', () => {
        console.log('🚀 Redis ready for commands');
      });

      this.redis.on('error', (error: Error) => {
        console.error('❌ Redis connection error:', error.message);
        console.error('❌ Error details:', error);
        console.error('❌ Error stack:', error.stack);
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed');
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });
    } catch (error) {
      console.error('Redis init failed:', error);
    }
  }

  async cacheSearchResults(query: string, results: YouTubeSearchResult[]): Promise<void> {
    if (!this.redis) {
      console.log('❌ Redis not initialized, skipping cache');
      return;
    }

    try {
      const cacheKey = this.SEARCH_CACHE_PREFIX + this.normalizeQuery(query);
      const cachedData: CachedSearchResult = {
        query: query.toLowerCase(),
        results,
        timestamp: Date.now(),
        expiresAt: Date.now() + (this.CACHE_TTL * 1000)
      };

      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(cachedData));
      console.log(`💾 Cached: "${query}"`);
    } catch (error) {
      console.error('Cache failed:', error);
    }
  }

  // Returns cached results with metadata for SWR logic
  async getCachedSearchResultsWithMeta(query: string): Promise<{ results: YouTubeSearchResult[]; timestamp: number; expiresAt: number } | null> {
    if (!this.redis) {
      console.log('❌ Redis not initialized, skipping cache check')
      return null
    }

    try {
      const cacheKey = this.SEARCH_CACHE_PREFIX + this.normalizeQuery(query)
      const cachedData = await this.redis.get(cacheKey)

      if (cachedData) {
        const parsed: CachedSearchResult = JSON.parse(cachedData)
        if (Date.now() < parsed.expiresAt) {
          console.log(`🎯 Cache hit (with meta): "${query}"`)
          return { results: parsed.results, timestamp: parsed.timestamp, expiresAt: parsed.expiresAt }
        }
        await this.redis.del(cacheKey)
      }
      return null
    } catch (error) {
      console.error('Get cache (with meta) failed:', error)
      return null
    }
  }

  private normalizeQuery(query: string): string {
    // Fall back to light normalization if canonicalization drops everything
    // (e.g. query is entirely stopwords/punctuation)
    const canonical = canonicalizeQuery(query);
    if (canonical) return canonical;
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  async cachePlaylistItems(playlistId: string, items: PlaylistCacheItem[]): Promise<void> {
    if (!this.redis) {
      console.log('❌ Redis not initialized, skipping playlist cache');
      return;
    }

    try {
      const cacheKey = this.PLAYLIST_CACHE_PREFIX + playlistId;
      await this.redis.setex(cacheKey, this.PLAYLIST_CACHE_TTL, JSON.stringify(items));
      console.log(`💾 Cached playlist: "${playlistId}" (${items.length} items)`);
    } catch (error) {
      console.error('Playlist cache failed:', error);
    }
  }

  async getCachedPlaylistItems(playlistId: string): Promise<PlaylistCacheItem[] | null> {
    if (!this.redis) {
      console.log('❌ Redis not initialized, skipping playlist cache check');
      return null;
    }

    try {
      const cacheKey = this.PLAYLIST_CACHE_PREFIX + playlistId;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        console.log(`🎯 Playlist cache hit: "${playlistId}"`);
        return JSON.parse(cached) as PlaylistCacheItem[];
      }
      return null;
    } catch (error) {
      console.error('Get playlist cache failed:', error);
      return null;
    }
  }
}

export interface PlaylistCacheItem {
  videoId: string;
  title: string;
  thumbnail: string;
}

export const cacheService = new CacheService();
export default cacheService;
