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
                select: { id: true, name: true, email: true, isPremium: true }
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

    // If user is neither host nor member, auto-join them (handles share links)
    if (!isHost && !isMember) {
        try {
            // Ensure user exists in database (handles new users from share links)
            await prisma.user.upsert({
                where: { id: session.user.id },
                create: {
                    id: session.user.id,
                    email: session.user.email ?? '',
                    name: session.user.name,
                    image: session.user.image,
                },
                update: {},
            })

            // Create room membership (use upsert to handle race conditions)
            await prisma.roomMember.upsert({
                where: {
                    roomId_userId: {
                        roomId,
                        userId: session.user.id,
                    },
                },
                create: {
                    roomId,
                    userId: session.user.id,
                },
                update: {},
            })
        } catch (error) {
            // Ignore unique constraint errors (P2002) - means user/membership already exists
            // This handles race conditions with the join route
            if (!(error instanceof Error) || !('code' in error) || (error as { code: string }).code !== 'P2002') {
                throw error
            }
        }
    }

    // Get current user's premium status + themes in one query
    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isPremium: true, boughtThemes: true }
    })

    // Apply same logic as /api/user/themes GET
    let boughtThemes = currentUser?.boughtThemes || ['default'];
    if (currentUser?.isPremium && !boughtThemes.includes('love')) {
        boughtThemes = [...boughtThemes, 'love'];
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
            email: room.host.email,
            isPremium: room.host.isPremium
        } : null,
        isHost,
        isPremium: currentUser?.isPremium ?? false,
        isHostPremium: room.host?.isPremium ?? false,

        // User themes
        boughtThemes,

        // Queue data
        queue: room.queueItems,
        currentQueueIndex: room.currentQueueIndex ?? 0
    })
}
