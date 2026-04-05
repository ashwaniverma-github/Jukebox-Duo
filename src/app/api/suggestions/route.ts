// GET /api/suggestions?q=arji -> { suggestions: [{ label, source }] }
// Zero YouTube API cost: serves from local songsDatabase + Redis canonical-query index.
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import cacheService from '@/lib/cache'
import { songsDatabase } from '@/lib/songs-data'

type Suggestion = { label: string; source: 'library' | 'cached' }
const MAX_SUGGESTIONS = 8
const MAX_CACHED = 4  // reserve slots for cached canonicals so they aren't crowded out by library hits

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ suggestions: [] }, { status: 401 })
  }

  const qRaw = (new URL(req.url, 'http://localhost').searchParams.get('q') || '').trim().toLowerCase()
  if (qRaw.length < 2) return NextResponse.json({ suggestions: [] })

  const suggestions: Suggestion[] = []
  const seen = new Set<string>()

  // Kick off Redis cached lookup in parallel with library match. Race it against a short
  // timeout so Upstash cold-starts or transient latency don't block the suggestions response.
  // We prefix-match on the user's last typed token (the word they're actively completing)
  // because canonicals are alphabetized internally - prefix-matching the full raw input
  // would miss entries whose first alphabetic token doesn't start with what the user typed.
  const lastToken = qRaw.split(/\s+/).filter(Boolean).pop() || ''
  const CACHED_TIMEOUT_MS = 600
  const cachedPromise: Promise<string[]> = lastToken.length >= 2
    ? Promise.race([
        cacheService.getSuggestions(lastToken, MAX_CACHED).catch(() => []),
        new Promise<string[]>(resolve => setTimeout(() => resolve([]), CACHED_TIMEOUT_MS))
      ])
    : Promise.resolve([])

  // 1) Cached canonicals (up to MAX_CACHED slots) - awaited with timeout guard
  const cached = await cachedPromise
  for (const c of cached) {
    const cKey = c.toLowerCase()
    if (!seen.has(cKey)) {
      seen.add(cKey)
      suggestions.push({ label: c, source: 'cached' })
    }
  }

  // 2) Local library: substring match on title OR artist, ranked by views - fills remaining slots
  const remaining = MAX_SUGGESTIONS - suggestions.length
  if (remaining > 0) {
    const libHits = songsDatabase
      .filter(s => s.title.toLowerCase().includes(qRaw) || s.artist.toLowerCase().includes(qRaw))
      .sort((a, b) => b.views - a.views)
      .slice(0, remaining)
    for (const s of libHits) {
      const label = `${s.title} - ${s.artist}`
      const key = label.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        suggestions.push({ label, source: 'library' })
      }
    }
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, MAX_SUGGESTIONS) })
}
