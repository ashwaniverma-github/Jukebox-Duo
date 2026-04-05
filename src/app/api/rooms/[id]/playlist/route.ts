import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { checkRoomAccess } from '../../../../../lib/room-auth'
import youtubeKeyManager from '@/lib/youtube-keys'
import cacheService, { PlaylistCacheItem } from '@/lib/cache'

// We will return success and let the CLIENT (who called this API) emit the socket event to notify others.

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { authorized, roomExists } = await checkRoomAccess(roomId, session.user.id)
    if (!roomExists) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    if (!authorized) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Check if user is premium - playlist import is a premium feature
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isPremium: true }
    })

    if (!user?.isPremium) {
        return NextResponse.json({
            error: 'Playlist import is a premium feature',
            isPremiumRequired: true
        }, { status: 403 })
    }

    const { playlistUrl } = await req.json()

    if (!playlistUrl || typeof playlistUrl !== 'string') {
        return NextResponse.json({ error: 'Invalid playlist URL' }, { status: 400 })
    }

    // Extract Playlist ID
    let playlistId = '';
    try {
        const url = new URL(playlistUrl);
        playlistId = url.searchParams.get('list') || '';
    } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    if (!playlistId) {
        return NextResponse.json({ error: 'Could not find playlist ID in URL' }, { status: 400 })
    }

    try {
        // Check playlist cache first to avoid burning quota on repeat imports
        const cachedItems = await cacheService.getCachedPlaylistItems(playlistId);
        let normalizedItems: PlaylistCacheItem[];

        if (cachedItems && cachedItems.length > 0) {
            normalizedItems = cachedItems;
        } else {
            // Fetch from YouTube
            const apiKey = youtubeKeyManager.getNextKey();
            if (!apiKey) {
                return NextResponse.json({ error: 'Service temporarily unavailable (Quota)' }, { status: 503 })
            }

            const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems` +
                `?part=snippet` +
                `&maxResults=50` + // Limit to 50 for now
                `&playlistId=${playlistId}` +
                `&key=${apiKey}`;

            const res = await fetch(ytUrl);

            if (!res.ok) {
                const errorData = await res.json();
                youtubeKeyManager.handleApiError(apiKey, res, errorData);
                return NextResponse.json({ error: 'Failed to fetch playlist from YouTube' }, { status: res.status })
            }

            const data = await res.json();
            const items = data.items || [];

            if (items.length === 0) {
                return NextResponse.json({ error: 'Playlist is empty or private' }, { status: 400 })
            }

            // Filter valid items and normalize to PlaylistCacheItem shape
            interface YouTubePlaylistItem {
                snippet: {
                    title: string;
                    resourceId: {
                        videoId: string;
                    };
                    thumbnails?: {
                        default?: {
                            url: string;
                        };
                    };
                };
            }

            // Private/deleted videos lose their thumbnails regardless of API locale,
            // so thumbnail presence is the reliable cross-locale heuristic. We also keep
            // the English string match as a fast-path and guard videoId presence.
            normalizedItems = (items as YouTubePlaylistItem[])
                .filter((item) => {
                    if (!item.snippet?.resourceId?.videoId) return false
                    const thumbUrl = item.snippet.thumbnails?.default?.url
                    if (!thumbUrl) return false // private/deleted/unavailable — works in any locale
                    const title = item.snippet.title
                    if (title === 'Private video' || title === 'Deleted video') return false
                    return true
                })
                .map((item) => ({
                    videoId: item.snippet.resourceId.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails!.default!.url
                }));

            // Cache for 7 days
            if (normalizedItems.length > 0) {
                try { await cacheService.cachePlaylistItems(playlistId, normalizedItems) } catch { }
            }
        }

        if (normalizedItems.length === 0) {
            return NextResponse.json({ error: 'Playlist is empty or private' }, { status: 400 })
        }

        // Safe assignment since we checked session.user.id earlier
        const userId = session.user.id;

        // Use interactive transaction to prevent race conditions with concurrent imports
        const newItemCount = await prisma.$transaction(async (tx) => {
            const currentCount = await tx.queueItem.count({ where: { roomId: roomId } });

            const newItemsData = normalizedItems.map((item, index: number) => ({
                roomId: roomId,
                videoId: item.videoId,
                title: item.title.slice(0, 500),
                thumbnail: item.thumbnail,
                order: currentCount + index,
                addedById: userId
            }));

            if (newItemsData.length > 0) {
                await tx.queueItem.createMany({
                    data: newItemsData
                });
            }

            return newItemsData.length;
        });

        return NextResponse.json({
            success: true,
            count: newItemCount,
            message: `Added ${newItemCount} songs to queue`
        });

    } catch (err) {
        console.error('Playlist import error:', err);
        return NextResponse.json({ error: 'Internal server error during import' }, { status: 500 })
    }
}
