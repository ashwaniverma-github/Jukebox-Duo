// app/api/rooms/[id]/search/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { checkRoomAccess } from '../../../../../lib/room-auth'
import youtubeKeyManager, { YouTubeAPIError } from '@/lib/youtube-keys'
import cacheService, { canonicalizeQuery } from '@/lib/cache'
import prisma from '../../../../../lib/prisma'
import { songsDatabase } from '../../../../../lib/songs-data'

// Simple in-memory rate limiter per user or IP
type Bucket = { count: number; resetAt: number }
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 50 // Increased since we have multiple API keys
const buckets = new Map<string, Bucket>()
const SWR_STALE_AFTER_MS = 3 * 24 * 60 * 60 * 1000 // 3 days — background refresh popular queries
const FREE_USER_DAILY_SEARCH_LIMIT = 20 // API-hitting searches; cache hits don't count
const LIBRARY_MATCH_THRESHOLD = 0.75 // fraction of query tokens that must appear in song title+artist

// Process-scoped counters to measure cache efficacy. Reset on deploy.
const metrics = { cacheHits: 0, libraryHits: 0, apiCalls: 0, quotaBlocks: 0 }
// Periodic log so metrics show up in Vercel/Sentry logs without a debug endpoint
setInterval(() => {
  const total = metrics.cacheHits + metrics.libraryHits + metrics.apiCalls
  if (total === 0) return
  const hitRate = ((metrics.cacheHits + metrics.libraryHits) / total * 100).toFixed(1)
  console.log(`📊 Search metrics — cache:${metrics.cacheHits} library:${metrics.libraryHits} api:${metrics.apiCalls} blocked:${metrics.quotaBlocks} hitRate:${hitRate}%`)
}, 60 * 60 * 1000).unref()

// Periodic cleanup of expired rate limit buckets to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}, 5 * 60 * 1000).unref()

function getClientKey(userId: string | undefined, req: Request): string {
  if (userId) return `user:${userId}`
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous').split(',')[0].trim()
  return `ip:${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }
  if (existing.count < RATE_LIMIT_MAX) {
    existing.count += 1
    return { allowed: true }
  }
  return { allowed: false, retryAfterMs: existing.resetAt - now }
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle?: string;
    description?: string;
    thumbnails: {
      default: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    duration?: string;
  };
}

// In-flight request deduplication map (server-side coalescing by normalized query)
type SearchResultItem = { videoId: string; title: string; thumbnail: string }
const inFlightSearches = new Map<string, Promise<SearchResultItem[]>>()

function normalizeQueryForKey(q: string) {
  // Must match cache.ts normalization so in-flight dedupe and Redis keys align
  const canonical = canonicalizeQuery(q)
  return canonical || q.toLowerCase().trim().replace(/\s+/g, ' ')
}

function scheduleBackgroundRefresh(q: string, runner: (q: string) => Promise<SearchResultItem[]>) {
  const key = normalizeQueryForKey(q)
  if (inFlightSearches.has(key)) return
  const promise = runner(q)
    .catch(() => [] as SearchResultItem[])
    .finally(() => { inFlightSearches.delete(key) })
  inFlightSearches.set(key, promise)
}

// Comprehensive YouTube Shorts filtering
function filterShorts(items: YouTubeSearchItem[]): YouTubeSearchItem[] {
  return items.filter(item => {
    // 1. Check for /shorts/ in thumbnail URLs (most reliable indicator)
    const hasShortsUrl =
      item.snippet?.thumbnails?.default?.url?.includes('/shorts/') ||
      item.snippet?.thumbnails?.medium?.url?.includes('/shorts/') ||
      item.snippet?.thumbnails?.high?.url?.includes('/shorts/');

    // 2. Check for typical Shorts keywords in titles
    const title = item.snippet?.title?.toLowerCase() || '';
    const hasShortsKeywords =
      title.includes('#shorts') ||
      title.includes('#short') ||
      title.includes('youtube shorts') ||
      title.includes('yt shorts') ||
      title.includes('shorts video') ||
      title.includes('short video') ||
      title.includes('#ytshorts') ||
      title.includes('#youtubeshorts');

    // 3. Check for vertical aspect ratio in thumbnails (Shorts are typically 9:16)
    const defaultThumb = item.snippet?.thumbnails?.default;
    const hasVerticalAspect = defaultThumb &&
      defaultThumb.url &&
      (defaultThumb.url.includes('hq720_shorts') ||
        defaultThumb.url.includes('mqdefault_6s') ||
        defaultThumb.url.includes('hqdefault_shorts'));

    // 4. Check channel names that commonly post shorts
    const channelTitle = item.snippet?.channelTitle?.toLowerCase() || '';
    const isShortsChannel =
      channelTitle.includes('shorts') ||
      channelTitle.includes('viral') ||
      channelTitle.includes('tiktok');

    // 5. Check for common shorts description patterns
    const description = item.snippet?.description?.toLowerCase() || '';
    const hasShortsDescription =
      description.includes('#shorts') ||
      description.includes('short video') ||
      description.includes('viral video') ||
      description.includes('tiktok');

    // Filter out if ANY shorts indicator is found
    const isShort = hasShortsUrl ||
      hasShortsKeywords ||
      hasVerticalAspect ||
      isShortsChannel ||
      hasShortsDescription;

    // Log filtered shorts for debugging
    if (isShort) {
      console.log(`Filtered short: "${title}" - Reason: ${hasShortsUrl ? 'URL' :
          hasShortsKeywords ? 'Keywords' :
            hasVerticalAspect ? 'Aspect' :
              isShortsChannel ? 'Channel' :
                'Description'
        }`);
    }

    return !isShort;
  });
}

// Core search runner used by GET and SWR background refresh
async function performSearchAndCache(query: string): Promise<SearchResultItem[]> {
  const attemptKeys = youtubeKeyManager.getKeyAttemptOrder()
  if (attemptKeys.length === 0) return []

  for (const apiKey of attemptKeys) {
    try {
      const ytUrl = `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet&type=video&maxResults=40` +
        `&q=${encodeURIComponent(query)}` +
        `&order=relevance` +
        `&regionCode=US` +
        `&key=${apiKey}`

      const res = await fetch(ytUrl)

      if (!res.ok) {
        let errorData: YouTubeAPIError | null = null
        try {
          errorData = await res.json()
        } catch { }
        youtubeKeyManager.handleApiError(apiKey, res, errorData)
        continue
      }

      const json = await res.json()
      const filtered = filterShorts(json.items || [])
      const itemsToReturn: SearchResultItem[] = filtered.slice(0, 10).map((i: YouTubeSearchItem) => ({
        videoId: i.id.videoId,
        title: i.snippet.title,
        thumbnail: i.snippet.thumbnails.default.url
      }))

      try { youtubeKeyManager.updateQuotaUsage(apiKey, 100) } catch { }
      try { await cacheService.cacheSearchResults(query, itemsToReturn) } catch { }
      return itemsToReturn
    } catch {
      // Try next key
      continue
    }
  }

  return []
}

// Fuzzy match the canonicalized query against the local songs library.
// Returns up to 10 matches sorted by token-overlap score, then view count.
// Zero YouTube API cost when this hits.
function matchLocalLibrary(canonicalQ: string): SearchResultItem[] {
  const qTokens = canonicalQ.split(' ').filter(Boolean)
  if (qTokens.length === 0) return []
  const scored = songsDatabase
    .map(s => {
      const hay = `${s.title} ${s.artist}`.toLowerCase()
      const hits = qTokens.filter(t => hay.includes(t)).length
      return { song: s, score: hits / qTokens.length }
    })
    .filter(x => x.score >= LIBRARY_MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score || b.song.views - a.song.views)
    .slice(0, 10)
  return scored.map(x => ({
    videoId: x.song.videoId,
    title: `${x.song.title} - ${x.song.artist}`,
    thumbnail: `https://img.youtube.com/vi/${x.song.videoId}/default.jpg`
  }))
}

// Check free user's daily search quota and increment atomically if allowed.
// Premium users bypass entirely. Only called on true API-hitting searches.
// Returns { allowed: true } or { allowed: false, resetInHours }.
async function checkAndIncrementFreeUserQuota(
  userId: string,
  isPremium: boolean,
  dailySearchCount: number,
  dailySearchResetAt: Date | null
): Promise<{ allowed: boolean; resetInHours?: number }> {
  if (isPremium) return { allowed: true }

  const now = new Date()
  const DAY_MS = 24 * 60 * 60 * 1000
  const needsReset = !dailySearchResetAt || (now.getTime() - dailySearchResetAt.getTime()) >= DAY_MS

  if (needsReset) {
    await prisma.user.update({
      where: { id: userId },
      data: { dailySearchCount: 1, dailySearchResetAt: now }
    })
    return { allowed: true }
  }

  if (dailySearchCount >= FREE_USER_DAILY_SEARCH_LIMIT) {
    const resetInHours = Math.ceil((DAY_MS - (now.getTime() - dailySearchResetAt!.getTime())) / (60 * 60 * 1000))
    return { allowed: false, resetInHours }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { dailySearchCount: { increment: 1 } }
  })
  return { allowed: true }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params

  // Require authenticated user
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Consolidated auth check: 1 query instead of 2
  const { authorized, roomExists } = await checkRoomAccess(roomId, session.user.id)
  if (!roomExists) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const urlObj = new URL(req.url, 'http://localhost')
  const qRaw = urlObj.searchParams.get('q') || ''
  const q = qRaw.trim()

  // Input validation
  if (!q) return NextResponse.json([], { status: 200 })
  if (q.length < 3) {
    return NextResponse.json([], { status: 200 })
  }
  if (q.length > 100) {
    return NextResponse.json({ error: 'Query too long' }, { status: 400 })
  }

  // Rate limiting
  const key = getClientKey(session.user.id, req)
  const { allowed, retryAfterMs } = checkRateLimit(key)
  if (!allowed) {
    const res = NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    if (retryAfterMs) res.headers.set('Retry-After', Math.ceil(retryAfterMs / 1000).toString())
    return res
  }

  // SWR: return cache immediately if present, then refresh in background
  // Cache hits don't count against free-user daily quota — free experience for popular searches.
  console.log(`🔍 Checking cache for: "${q}"`)
  try {
    const cachedWithMeta = await cacheService.getCachedSearchResultsWithMeta(q)
    if (cachedWithMeta?.results?.length) {
      console.log(`🎯 Returning cached results for: "${q}" (SWR)`)
      metrics.cacheHits++
      const ageMs = Date.now() - cachedWithMeta.timestamp
      if (ageMs >= SWR_STALE_AFTER_MS) {
        // Trigger background refresh only when cache is stale
        scheduleBackgroundRefresh(q, async (_q) => {
          return await performSearchAndCache(_q)
        })
      } else {
        console.log(`⏳ Cache is fresh (age ${(ageMs / 3600000).toFixed(1)}h), skipping background refresh`)
      }
      return NextResponse.json(cachedWithMeta.results)
    }
    console.log(`No cache found for: "${q}"`)
  } catch (error) {
    console.error('Cache check failed:', error)
    // Continue with API call if cache fails
  }

  // Local library fallback — zero API cost. Match against ~900 curated songs.
  const canonicalQ = canonicalizeQuery(q)
  const libraryMatches = matchLocalLibrary(canonicalQ)
  if (libraryMatches.length > 0) {
    console.log(`📚 Library match for "${q}" → ${libraryMatches.length} results`)
    metrics.libraryHits++
    // Write to Redis so SWR keeps this fresh and subsequent users skip the match work
    try { await cacheService.cacheSearchResults(q, libraryMatches) } catch { }
    return NextResponse.json(libraryMatches)
  }

  // Enforce free-user daily API-search cap BEFORE burning YouTube quota.
  // Premium users bypass. Cache/library hits above already returned without checking this.
  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true, dailySearchCount: true, dailySearchResetAt: true }
  })
  if (userRecord) {
    const quotaCheck = await checkAndIncrementFreeUserQuota(
      session.user.id,
      userRecord.isPremium,
      userRecord.dailySearchCount,
      userRecord.dailySearchResetAt
    )
    if (!quotaCheck.allowed) {
      metrics.quotaBlocks++
      return NextResponse.json({
        error: `Daily search limit reached (${FREE_USER_DAILY_SEARCH_LIMIT} API searches). Upgrade to premium for unlimited searches.`,
        upgradeRequired: true,
        resetInHours: quotaCheck.resetInHours
      }, { status: 429 })
    }
  }

  // In-flight dedupe for foreground request
  const inflightKey = normalizeQueryForKey(q)
  if (inFlightSearches.has(inflightKey)) {
    const results = await inFlightSearches.get(inflightKey)!
    return NextResponse.json(results)
  }

  metrics.apiCalls++
  const promise = (async () => await performSearchAndCache(q))()
  inFlightSearches.set(inflightKey, promise)
  const results = await promise.finally(() => inFlightSearches.delete(inflightKey))

  if (results.length) {
    return NextResponse.json(results)
  }

  if (!youtubeKeyManager.hasAvailableKeys()) {
    const { message, estimatedResetHours } = youtubeKeyManager.getQuotaExhaustedMessage()
    return NextResponse.json({
      error: message,
      quotaExceeded: true,
      estimatedResetHours
    }, { status: 503 })
  }

  return NextResponse.json({ error: 'Search failed' }, { status: 500 })
}
