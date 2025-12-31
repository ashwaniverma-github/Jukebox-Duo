// app/api/rooms/[id]/queue/route.ts
import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { checkRoomAccess, getRoomWithAccess } from '../../../../../lib/room-auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Consolidated auth check: 1 query instead of 2
  const { authorized, roomExists } = await checkRoomAccess(roomId, session.user.id)
  if (!roomExists) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { videoId, title, thumbnail } = await req.json()
  if (!videoId || typeof videoId !== 'string') {
    return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 })
  }
  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  }
  if (thumbnail && typeof thumbnail !== 'string') {
    return NextResponse.json({ error: 'Invalid thumbnail' }, { status: 400 })
  }
  const count = await prisma.queueItem.count({ where: { roomId: roomId } })
  const item = await prisma.queueItem.create({
    data: {
      roomId: roomId,
      videoId, title, thumbnail,
      order: count,
      addedById: session.user.id,
    }
  })

  return NextResponse.json(item)
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  // No auth required to view queue, but ensure room exists
  const room = await prisma.room.findUnique({ where: { id: roomId }, select: { id: true, currentQueueIndex: true } })
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }
  const items = await prisma.queueItem.findMany({
    where: { roomId },
    orderBy: { order: 'asc' }
  })
  const currentQueueIndex = room.currentQueueIndex ?? 0;
  return NextResponse.json({ queue: items, currentQueueIndex });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('itemId')

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
  }

  // Consolidated auth check + room data: 1 query instead of 3
  const { room, authorized } = await getRoomWithAccess(roomId, session.user.id)
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const queueItem = await prisma.queueItem.findUnique({ where: { id: itemId } })
  if (!queueItem || queueItem.roomId !== roomId) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  // Get the position of the item being deleted
  const deletedItemOrder = queueItem.order
  const currentIndex = room.currentQueueIndex || 0

  // Get remaining items (excluding the one to delete) for reordering
  const remainingItems = await prisma.queueItem.findMany({
    where: { roomId, id: { not: itemId } },
    orderBy: { order: 'asc' },
    select: { id: true, order: true }
  })

  // Calculate new current index
  let newCurrentIndex = currentIndex
  if (deletedItemOrder < currentIndex) {
    newCurrentIndex = Math.max(0, currentIndex - 1)
  } else if (deletedItemOrder === currentIndex) {
    if (remainingItems.length === 0) {
      newCurrentIndex = 0
    } else if (currentIndex >= remainingItems.length) {
      newCurrentIndex = remainingItems.length - 1
    }
  }

  // Batch all operations in a single transaction: delete + reorder + update index
  // This reduces N+2 queries to just 1 transaction
  await prisma.$transaction([
    // Delete the item
    prisma.queueItem.delete({ where: { id: itemId } }),
    // Batch reorder all remaining items
    ...remainingItems.map((item, i) =>
      prisma.queueItem.update({
        where: { id: item.id },
        data: { order: i }
      })
    ),
    // Update room's currentQueueIndex if changed
    ...(newCurrentIndex !== currentIndex ? [
      prisma.room.update({
        where: { id: roomId },
        data: { currentQueueIndex: newCurrentIndex }
      })
    ] : [])
  ])

  if (newCurrentIndex !== currentIndex) {
    console.log(`Updated currentQueueIndex from ${currentIndex} to ${newCurrentIndex} after deleting item at position ${deletedItemOrder}`)
  }

  return NextResponse.json({
    success: true,
    deletedOrder: deletedItemOrder,
    oldCurrentIndex: currentIndex,
    newCurrentIndex,
    remainingItemsCount: remainingItems.length
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Consolidated auth check - only host can update index
  const { isHost, roomExists } = await checkRoomAccess(roomId, session.user.id)
  if (!roomExists) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }
  if (!isHost) {
    return NextResponse.json({ error: 'Only host can update current index' }, { status: 403 })
  }

  const { currentIndex } = await req.json()
  if (typeof currentIndex !== 'number' || currentIndex < 0) {
    return NextResponse.json({ error: 'Invalid currentIndex' }, { status: 400 })
  }

  // Update room's current playing index
  await prisma.room.update({
    where: { id: roomId },
    data: { currentQueueIndex: currentIndex }
  })

  return NextResponse.json({ success: true, currentIndex })
}
