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

  // Check cache first
  console.log(`🔍 Checking cache for: "${q}"`)
  try {
    const cachedResults = await cacheService.getCachedSearchResults(q)
    if (cachedResults) {
      console.log(`🎯 Returning cached results for: "${q}"`)
      return NextResponse.json(cachedResults)
    }
    console.log(`No cache found for: "${q}"`)
  } catch (error) {
    console.error('Cache check failed:', error)
    // Continue with API call if cache fails
  }

  // Get next available API key
  const apiKey = youtubeKeyManager.getNextKey()
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'All YouTube API keys have exceeded daily quota. Please try again tomorrow.' 
    }, { status: 503 })
  }

  try {
    // Search YouTube without duration filter to get all songs including 2-4 minute tracks
    // Use the original query but optimize for music results
    const ytUrl = `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet&type=video&maxResults=40` + // Increased significantly to account for aggressive shorts filtering
      `&q=${encodeURIComponent(q)}` +
      `&order=relevance` + // Order by relevance to get popular songs first
      `&regionCode=US` + // US region for better music results
      `&key=${apiKey}`

    const res = await fetch(ytUrl)
    
    if (!res.ok) {
      let errorData: YouTubeAPIError | null = null
      try {
        errorData = await res.json()
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError)
      }

      // Handle the error using the key manager
      const { shouldRetry } = youtubeKeyManager.handleApiError(apiKey, res, errorData)
      
      // Try with another key if error handling suggests we should retry
      if (shouldRetry) {
        const fallbackKey = youtubeKeyManager.getNextKey()
        if (fallbackKey) {
          console.log('Attempting fallback with another API key')
          const fallbackUrl = `https://www.googleapis.com/youtube/v3/search` +
            `?part=snippet&type=video&maxResults=40` +
            `&q=${encodeURIComponent(q)}` +
            `&order=relevance` +
            `&regionCode=US` +
            `&key=${fallbackKey}`
          
          try {
            const fallbackRes = await fetch(fallbackUrl)
            if (fallbackRes.ok) {
              const json = await fallbackRes.json()
              const originalCount = json.items?.length || 0
              const filteredItems = filterShorts(json.items || [])
              const filteredCount = filteredItems.length
              
              console.log(`Fallback shorts filtering: ${originalCount} → ${filteredCount} (filtered out ${originalCount - filteredCount} shorts)`)
              
              const items = filteredItems.slice(0, 10).map((i: YouTubeSearchItem) => ({
                videoId: i.id.videoId,
                title: i.snippet.title,
                thumbnail: i.snippet.thumbnails.default.url
              }))

              // Cache the results
              try {
                await cacheService.cacheSearchResults(q, items)
              } catch (error) {
                console.error('Failed to cache results:', error)
              }

              return NextResponse.json(items)
            } else {
              // Handle fallback error
              let fallbackErrorData: YouTubeAPIError | null = null
              try {
                fallbackErrorData = await fallbackRes.json()
              } catch (parseError) {
                console.error('Failed to parse fallback error response:', parseError)
              }

              youtubeKeyManager.handleApiError(fallbackKey, fallbackRes, fallbackErrorData)
            }
          } catch (fallbackError) {
            console.error('Fallback API call failed:', fallbackError)
          }
        }
      }
      
      // If we get here, all available keys have failed
      if (!youtubeKeyManager.hasAvailableKeys()) {
        const { message, estimatedResetHours } = youtubeKeyManager.getQuotaExhaustedMessage()
        
        return NextResponse.json({ 
          error: message,
          quotaExceeded: true,
          estimatedResetHours
        }, { status: 503 })
      }

      throw new Error(`YouTube API failed: ${errorData?.error?.message || 'Unknown error'}`)
    }

    const json = await res.json()
    
    // Filter out shorts and limit results
    const originalCount = json.items?.length || 0
    const filteredItems = filterShorts(json.items || [])
    const filteredCount = filteredItems.length
    
    // Log filtering effectiveness
    console.log(`Shorts filtering: ${originalCount} → ${filteredCount} (filtered out ${originalCount - filteredCount} shorts)`)
    
    // Ensure we have enough results
    if (filteredCount === 0 && originalCount > 0) {
      console.warn('All results were filtered as shorts - this might be too aggressive filtering')
    }
    
    const items = filteredItems.slice(0, 10).map((i: YouTubeSearchItem) => ({
      videoId: i.id.videoId,
      title: i.snippet.title,
      thumbnail: i.snippet.thumbnails.default.url
    }))

    // Cache the results
    try {
      await cacheService.cacheSearchResults(q, items)
    } catch (error) {
      console.error('Failed to cache results:', error)
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error('YouTube search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
