// app/api/rooms/[id]/init/route.ts
// Consolidated room initialization endpoint - returns all data needed to render room page
// Reduces 2 HTTP requests + 4 DB queries to 1 HTTP request + 1 DB query

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: roomId } = await params

    // Require authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Single query: Get room with host info, queue items, and check membership
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
            id: true,
            name: true,
            hostId: true,
            currentQueueIndex: true,
            createdAt: true,
            host: {
                select: { id: true, name: true, email: true }
            },
            queueItems: {
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    videoId: true,
                    title: true,
                    thumbnail: true,
                    order: true
                }
            },
            members: {
                where: { userId: session.user.id },
                select: { id: true }
            }
        }
    })

    if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check authorization: user must be host or member
    const isHost = room.hostId === session.user.id
    const isMember = room.members.length > 0
    if (!isHost && !isMember) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Return consolidated response
    return NextResponse.json({
        // Room details
        id: room.id,
        name: room.name,
        createdAt: room.createdAt,
        host: room.host ? {
            id: room.host.id,
            name: room.host.name,
            email: room.host.email
        } : null,
        isHost,

        // Queue data
        queue: room.queueItems,
        currentQueueIndex: room.currentQueueIndex ?? 0
    })
}
