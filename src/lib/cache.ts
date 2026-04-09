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
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Unicode letters/numbers — preserves é, ñ, CJK, Cyrillic, Devanagari, etc.
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
  private readonly PLAYLIST_CACHE_TTL = 30 * 24 * 60 * 60; // 30 days - playlists barely change
  // Two parallel sorted sets: ZRANGEBYLEX only returns reliable results when all
  // members share the same score, so we separate the prefix-search structure
  // (uniform score) from the LRU-tracking structure (timestamp score).
  private readonly SUGGESTION_LEX_KEY = 'suggestion_lex';   // score=0 for all, for ZRANGEBYLEX
  private readonly SUGGESTION_LRU_KEY = 'suggestion_lru';   // score=timestamp, for LRU eviction
  private readonly SUGGESTION_INDEX_MAX = 2000; // cap size, LRU-evict oldest beyond this

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
      // Register canonical in the suggestion index (LRU by timestamp score)
      const canonical = this.normalizeQuery(query);
      await this.addToSuggestionIndex(canonical, query.toLowerCase());
      console.log(`💾 Cached: "${query}"`);
    } catch (error) {
      console.error('Cache failed:', error);
    }
  }

  async addToSuggestionIndex(canonical: string, original: string): Promise<void> {
    if (!this.redis || !canonical) return;
    try {
      // Index by each token so a prefix match on ANY word in the canonical surfaces it.
      // Members use the format `<token>\x00<canonical>\x00<original>` so we can dedupe
      // by canonical on read while returning the human-readable original for display.
      const tokens = canonical.split(' ').filter(Boolean);
      if (tokens.length === 0) return;
      const members = tokens.map(t => `${t}\x00${canonical}\x00${original}`);

      const now = Date.now();
      const lexArgs: (string | number)[] = [];
      const lruArgs: (string | number)[] = [];
      for (const m of members) {
        lexArgs.push(0, m);
        lruArgs.push(now, m);
      }
      // LEX set uses uniform score=0 so ZRANGEBYLEX returns reliable prefix ranges.
      // LRU set uses timestamp score so we can evict the oldest entries when over cap.
      await this.redis.zadd(this.SUGGESTION_LEX_KEY, ...lexArgs);
      await this.redis.zadd(this.SUGGESTION_LRU_KEY, ...lruArgs);

      // If LRU set exceeds the cap, evict the oldest entries from both structures.
      const size = await this.redis.zcard(this.SUGGESTION_LRU_KEY);
      if (size > this.SUGGESTION_INDEX_MAX) {
        const overflow = size - this.SUGGESTION_INDEX_MAX;
        const evict = await this.redis.zrange(this.SUGGESTION_LRU_KEY, 0, overflow - 1);
        if (evict.length) {
          await this.redis.zrem(this.SUGGESTION_LRU_KEY, ...evict);
          await this.redis.zrem(this.SUGGESTION_LEX_KEY, ...evict);
        }
      }
    } catch (error) {
      console.error('suggestion_index add failed:', error);
    }
  }

  async getSuggestions(prefix: string, limit = 10): Promise<string[]> {
    if (!this.redis || !prefix) return [];
    try {
      // ZRANGEBYLEX returns reliable results because all LEX entries have score=0.
      // Fetch extra since multiple tokens may map back to the same canonical.
      const raw = await this.redis.zrangebylex(
        this.SUGGESTION_LEX_KEY,
        `[${prefix}`,
        `[${prefix}\xff`,
        'LIMIT', 0, limit * 4
      );
      // Extract canonical (for dedup) and original (for display) from `token\x00canonical\x00original`.
      // Falls back to canonical if no second separator (old-format entries).
      const seen = new Set<string>();
      const result: string[] = [];
      for (const member of raw) {
        const sep = member.indexOf('\x00');
        if (sep < 0) continue;
        const rest = member.slice(sep + 1);
        const sep2 = rest.indexOf('\x00');
        const canonical = sep2 >= 0 ? rest.slice(0, sep2) : rest;
        const original = sep2 >= 0 ? rest.slice(sep2 + 1) : rest;
        if (!seen.has(canonical)) {
          seen.add(canonical);
          result.push(original);
          if (result.length >= limit) break;
        }
      }
      return result;
    } catch (error) {
      console.error('suggestion_index query failed:', error);
      return [];
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
          // Refresh suggestion index on hits so LRU tracks real usage and any entries
          // still in the old pre-token-index format get re-written with the current format.
          // Fire-and-forget - don't block the cache response.
          this.addToSuggestionIndex(this.normalizeQuery(query), query.toLowerCase()).catch(() => {})
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
