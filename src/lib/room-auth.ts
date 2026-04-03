// lib/room-auth.ts
// Consolidated room authorization helper to reduce database queries

import prisma from './prisma';

export interface RoomAuthResult {
    authorized: boolean;
    isHost: boolean;
    roomExists: boolean;
}

/**
 * Check if a user has access to a room (either as host or member)
 * Uses a single database query instead of 2 separate queries
 * 
 * @param roomId - The room ID to check
 * @param userId - The user ID to check
 * @returns RoomAuthResult with authorization status
 */
export async function checkRoomAccess(
    roomId: string,
    userId: string
): Promise<RoomAuthResult> {
    // Single query that checks both host status and membership
    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            OR: [
                { hostId: userId },
                { members: { some: { userId: userId } } }
            ]
        },
        select: {
            id: true,
            hostId: true
        }
    });

    if (!room) {
        // Either room doesn't exist or user has no access
        // Check if room exists at all
        const roomExists = await prisma.room.findUnique({
            where: { id: roomId },
            select: { id: true }
        });

        return {
            authorized: false,
            isHost: false,
            roomExists: !!roomExists
        };
    }

    return {
        authorized: true,
        isHost: room.hostId === userId,
        roomExists: true
    };
}

/**
 * Combined room existence and access check in a single query
 * More efficient when you need to know both room existence and user access
 * 
 * @param roomId - The room ID to check
 * @param userId - The user ID to check (optional, if null only checks room existence)
 * @returns Object with room data and access info
 */
export async function getRoomWithAccess(
    roomId: string,
    userId: string | null
) {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
            id: true,
            hostId: true,
            name: true,
            currentQueueIndex: true,
            members: userId ? {
                where: { userId },
                select: { id: true }
            } : false
        }
    });

    if (!room) {
        return { room: null, authorized: false, isHost: false };
    }

    const isHost = userId ? room.hostId === userId : false;
    const isMember = userId && room.members ? room.members.length > 0 : false;

    return {
        room: {
            id: room.id,
            name: room.name,
            hostId: room.hostId,
            currentQueueIndex: room.currentQueueIndex
        },
        authorized: isHost || isMember,
        isHost
    };
}
