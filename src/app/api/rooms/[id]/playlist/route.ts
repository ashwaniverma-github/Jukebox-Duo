import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { checkRoomAccess } from '../../../../../lib/room-auth'
import youtubeKeyManager from '@/lib/youtube-keys'

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

    // Fetch from YouTube
    const apiKey = youtubeKeyManager.getNextKey();
    if (!apiKey) {
        return NextResponse.json({ error: 'Service temporarily unavailable (Quota)' }, { status: 503 })
    }

    try {
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

        // Filter valid items and map to QueueItem format
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

        const validItems = (items as YouTubePlaylistItem[]).filter((item) =>
            item.snippet &&
            item.snippet.resourceId &&
            item.snippet.resourceId.videoId &&
            item.snippet.title !== 'Private video' &&
            item.snippet.title !== 'Deleted video'
        );

        // Get current max order
        const currentCount = await prisma.queueItem.count({ where: { roomId: roomId } });

        // Prepare data for createMany
        // Note: createMany is not supported in SQLite if you are using it, but Postgres/MySQL supports it. 
        // Assuming Postgres/MySQL based on project. If SQLite, we'd need a loop or Promise.all.
        // Checking package.json... prisma is used. 
        // Let's use a transaction with createMany to be safe/efficient.

        // Safe assignment since we checked session.user.id earlier
        const userId = session.user.id;

        const newItemsData = validItems.map((item, index: number) => ({
            roomId: roomId,
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails?.default?.url || '',
            order: currentCount + index,
            addedById: userId
        }));

        if (newItemsData.length > 0) {
            await prisma.queueItem.createMany({
                data: newItemsData
            });
        }

        return NextResponse.json({
            success: true,
            count: newItemsData.length,
            message: `Added ${newItemsData.length} songs to queue`
        });

    } catch (err) {
        console.error('Playlist import error:', err);
        return NextResponse.json({ error: 'Internal server error during import' }, { status: 500 })
    }
}
