import Redis from 'ioredis';

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
  private isConnected = false;
  private readonly CACHE_TTL = 24 * 60 * 60; // 24 hours
  private readonly SEARCH_CACHE_PREFIX = 'youtube_search:';
  // Suggestions are removed

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
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        console.log('🚀 Redis ready for commands');
      });

      this.redis.on('error', (error: Error) => {
        console.error('❌ Redis connection error:', error.message);
        console.error('❌ Error details:', error);
        console.error('❌ Error stack:', error.stack);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });
    } catch (error) {
      console.error('Redis init failed:', error);
      this.isConnected = false;
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

      // Suggestions removed
    } catch (error) {
      console.error('Cache failed:', error);
    }
  }

  async getCachedSearchResults(query: string): Promise<YouTubeSearchResult[] | null> {
    if (!this.redis) {
      console.log('❌ Redis not initialized, skipping cache check');
      return null;
    }

    try {
      const cacheKey = this.SEARCH_CACHE_PREFIX + this.normalizeQuery(query);
      const cachedData = await this.redis.get(cacheKey);

      if (cachedData) {
        const parsed: CachedSearchResult = JSON.parse(cachedData);
        if (Date.now() < parsed.expiresAt) {
          console.log(`🎯 Cache hit: "${query}"`);
          return parsed.results;
        }
        await this.redis.del(cacheKey);
      }
      return null;
    } catch (error) {
      console.error('Get cache failed:', error);
      return null;
    }
  }

  // Suggestions removed

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
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  async healthCheck(): Promise<boolean> {
    if (!this.redis) return false;
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
