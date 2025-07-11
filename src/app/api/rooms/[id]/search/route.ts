// app/api/rooms/[id]/search/route.ts
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const q = req.url ? new URL(req.url, 'http://localhost').searchParams.get('q') || '' : ''
  if (!q) return NextResponse.json([], { status: 200 })

  const key = process.env.YOUTUBE_API_KEY!
  const url = `https://www.googleapis.com/youtube/v3/search`
    + `?part=snippet&type=video&maxResults=10`
    + `&q=${encodeURIComponent(q)}`
    + `&key=${key}`

  const res = await fetch(url)
  const json = await res.json()
  const items = (json.items || []).map((i: any) => ({
    videoId: i.id.videoId,
    title: i.snippet.title,
    thumbnail: i.snippet.thumbnails.default.url
  }))

  return NextResponse.json(items)
}
