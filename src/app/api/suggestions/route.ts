// GET /api/suggestions?q=arji -> { suggestions: [{ label, source }] }
// Zero YouTube API cost: serves from local songsDatabase + Redis canonical-query index.
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import cacheService, { canonicalizeQuery } from '@/lib/cache'
import { songsDatabase } from '@/lib/songs-data'

type Suggestion = { label: string; source: 'library' | 'cached' }
const MAX_SUGGESTIONS = 8

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ suggestions: [] }, { status: 401 })
  }

  const qRaw = (new URL(req.url, 'http://localhost').searchParams.get('q') || '').trim().toLowerCase()
  if (qRaw.length < 2) return NextResponse.json({ suggestions: [] })

  const suggestions: Suggestion[] = []
  const seen = new Set<string>()

  // 1) Local library: substring match on title OR artist, ranked by views
  const libHits = songsDatabase
    .filter(s => s.title.toLowerCase().includes(qRaw) || s.artist.toLowerCase().includes(qRaw))
    .sort((a, b) => b.views - a.views)
    .slice(0, MAX_SUGGESTIONS)
  for (const s of libHits) {
    const label = `${s.title} - ${s.artist}`
    const key = label.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      suggestions.push({ label, source: 'library' })
    }
  }

  // 2) Cached canonical queries - prefix match on canonicalized input
  const canonical = canonicalizeQuery(qRaw)
  if (canonical && suggestions.length < MAX_SUGGESTIONS) {
    const cached = await cacheService.getSuggestions(canonical, MAX_SUGGESTIONS)
    for (const c of cached) {
      if (suggestions.length >= MAX_SUGGESTIONS) break
      if (!seen.has(c)) {
        seen.add(c)
        suggestions.push({ label: c, source: 'cached' })
      }
    }
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, MAX_SUGGESTIONS) })
}
