// app/api/rooms/[id]/search/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import prisma from '@/lib/prisma'

// Simple in-memory rate limiter per user or IP
type Bucket = { count: number; resetAt: number }
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
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

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const ytUrl = `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet&type=video&maxResults=10` +
    `&q=${encodeURIComponent(q)}` +
    `&key=${apiKey}`

  const res = await fetch(ytUrl)
  if (!res.ok) {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
  }
  const json = await res.json()
  const items = (json.items || []).map((i: { id: { videoId: string }; snippet: { title: string; thumbnails: { default: { url: string } } } }) => ({
    videoId: i.id.videoId,
    title: i.snippet.title,
    thumbnail: i.snippet.thumbnails.default.url
  }))

  return NextResponse.json(items)
}
