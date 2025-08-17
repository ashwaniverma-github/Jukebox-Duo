// app/api/rooms/[id]/search/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import prisma from '@/lib/prisma'
import youtubeKeyManager, { YouTubeAPIError } from '@/lib/youtube-keys'
import cacheService from '@/lib/cache'

// Simple in-memory rate limiter per user or IP
type Bucket = { count: number; resetAt: number }
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 50 // Increased since we have multiple API keys
const buckets = new Map<string, Bucket>()
const SWR_STALE_AFTER_MS = 12 * 60 * 60 * 1000 // 12 hours

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
  return q.toLowerCase().trim().replace(/\s+/g, ' ')
}

function scheduleBackgroundRefresh(q: string, runner: (q: string) => Promise<SearchResultItem[]>) {
  const key = normalizeQueryForKey(q)
  if (inFlightSearches.has(key)) return
  const promise = runner(q)
    .catch(() => [] as SearchResultItem[])
    .finally(() => { inFlightSearches.delete(key) })
  inFlightSearches.set(key, promise)
}

// Minimal shape for videos.list response items we care about
interface VideosListItem {
  id: string;
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string };
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
    
    // 6. Additional title patterns that indicate shorts
    const hasShortContentIndicators = 
      title.includes('viral') ||
      title.includes('trending') ||
      title.includes('meme') ||
      title.includes('funny moment') ||
      title.includes('quick') ||
      title.includes('30 sec') ||
      title.includes('60 sec') ||
      title.includes('1 min') ||
      title.includes('under 1') ||
      title.includes('vs ') && title.length < 50; // Short comparison videos
    
    // Filter out if ANY shorts indicator is found
    const isShort = hasShortsUrl || 
                   hasShortsKeywords || 
                   hasVerticalAspect || 
                   isShortsChannel || 
                   hasShortsDescription || 
                   hasShortContentIndicators;
    
    // Log filtered shorts for debugging
    if (isShort) {
      console.log(`Filtered short: "${title}" - Reason: ${
        hasShortsUrl ? 'URL' : 
        hasShortsKeywords ? 'Keywords' : 
        hasVerticalAspect ? 'Aspect' : 
        isShortsChannel ? 'Channel' : 
        hasShortsDescription ? 'Description' : 
        'Content'
      }`);
    }
    
    return !isShort;
  });
}

// Parse ISO 8601 duration (e.g., PT3M25S) to total seconds
function parseISODurationToSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
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
        } catch {}
        youtubeKeyManager.handleApiError(apiKey, res, errorData)
        continue
      }

      const json = await res.json()
      const ids = (json.items || [])
        .map((i: YouTubeSearchItem) => i?.id?.videoId)
        .filter(Boolean)
        .slice(0, 50)
        .join(',')

      let itemsToReturn: SearchResultItem[] = []

      if (ids) {
        try {
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos` +
            `?part=contentDetails,statistics&id=${ids}&key=${apiKey}`
          const detailsRes = await fetch(detailsUrl)
          if (detailsRes.ok) {
            const detailsJson = await detailsRes.json()
            const durationById: Record<string, number> = {}
            const viewCountById: Record<string, number> = {}
            for (const v of (detailsJson.items || []) as VideosListItem[]) {
              const id = v?.id
              const dur = v?.contentDetails?.duration
              if (id && dur) durationById[id] = parseISODurationToSeconds(dur)
              const vc = v?.statistics?.viewCount
              if (id && typeof vc === 'string') {
                const n = Number(vc)
                if (!Number.isNaN(n)) viewCountById[id] = n
              }
            }

            const MIN_DURATION_SECONDS = 90
            const MAX_DURATION_SECONDS = 540

            const filteredByDuration = (json.items || []).filter((i: YouTubeSearchItem) => {
              const id = i?.id?.videoId
              if (!id) return false
              const secs = durationById[id]
              if (typeof secs === 'number') {
                return secs >= MIN_DURATION_SECONDS && secs <= MAX_DURATION_SECONDS
              }
              return filterShorts([i]).length > 0
            })

            let finalItems = filteredByDuration.length > 0 ? filteredByDuration : filterShorts(json.items || [])
            finalItems = finalItems.sort((a: YouTubeSearchItem, b: YouTubeSearchItem) => {
              const av = viewCountById[a.id.videoId] ?? -1
              const bv = viewCountById[b.id.videoId] ?? -1
              return bv - av
            })

            itemsToReturn = finalItems.slice(0, 10).map((i: YouTubeSearchItem) => ({
              videoId: i.id.videoId,
              title: i.snippet.title,
              thumbnail: i.snippet.thumbnails.default.url
            }))
          } else {
            const heuristics = filterShorts(json.items || [])
            itemsToReturn = heuristics.slice(0, 10).map((i: YouTubeSearchItem) => ({
              videoId: i.id.videoId,
              title: i.snippet.title,
              thumbnail: i.snippet.thumbnails.default.url
            }))
          }
        } catch {
          const heuristics = filterShorts(json.items || [])
          itemsToReturn = heuristics.slice(0, 10).map((i: YouTubeSearchItem) => ({
            videoId: i.id.videoId,
            title: i.snippet.title,
            thumbnail: i.snippet.thumbnails.default.url
          }))
        }
      } else {
        const heuristics = filterShorts(json.items || [])
        itemsToReturn = heuristics.slice(0, 10).map((i: YouTubeSearchItem) => ({
          videoId: i.id.videoId,
          title: i.snippet.title,
          thumbnail: i.snippet.thumbnails.default.url
        }))
      }

      try { youtubeKeyManager.updateQuotaUsage(apiKey, 100) } catch {}
      try { await cacheService.cacheSearchResults(query, itemsToReturn) } catch {}
      return itemsToReturn
    } catch {
      // Try next key
      continue
    }
  }

  return []
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

  // Require membership in the room (or host)
  const membership = await prisma.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
    select: { id: true },
  })
  const isHost = await prisma.room.findFirst({
    where: { id: roomId, hostId: session.user.id },
    select: { id: true },
  })
  if (!membership && !isHost) {
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
  console.log(`🔍 Checking cache for: "${q}"`)
  try {
    const cachedWithMeta = await cacheService.getCachedSearchResultsWithMeta(q)
    if (cachedWithMeta?.results?.length) {
      console.log(`🎯 Returning cached results for: "${q}" (SWR)`) 
      const ageMs = Date.now() - cachedWithMeta.timestamp
      if (ageMs >= SWR_STALE_AFTER_MS) {
        // Trigger background refresh only when cache is stale
        scheduleBackgroundRefresh(q, async (_q) => {
          return await performSearchAndCache(_q)
        })
      } else {
        console.log(`⏳ Cache is fresh (age ${(ageMs/3600000).toFixed(1)}h), skipping background refresh`)
      }
      return NextResponse.json(cachedWithMeta.results)
    }
    console.log(`No cache found for: "${q}"`)
  } catch (error) {
    console.error('Cache check failed:', error)
    // Continue with API call if cache fails
  }

  // In-flight dedupe for foreground request
  const inflightKey = normalizeQueryForKey(q)
  if (inFlightSearches.has(inflightKey)) {
    const results = await inFlightSearches.get(inflightKey)!
    return NextResponse.json(results)
  }

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
