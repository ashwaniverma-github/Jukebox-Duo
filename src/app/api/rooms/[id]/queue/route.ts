// app/api/rooms/[id]/queue/route.ts
import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Ensure user is a member or host of the room
  const membership = await prisma.roomMember.findFirst({ where: { roomId, userId: session.user.id }, select: { id: true } })
  const isHost = await prisma.room.findFirst({ where: { id: roomId, hostId: session.user.id }, select: { id: true } })
  if (!membership && !isHost) {
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

  // Ensure user is a member or host of the room
  const membership = await prisma.roomMember.findFirst({ where: { roomId, userId: session.user.id }, select: { id: true } })
  const isHost = await prisma.room.findFirst({ where: { id: roomId, hostId: session.user.id }, select: { id: true } })
  if (!membership && !isHost) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    await prisma.queueItem.delete({
      where: { id: itemId }
    })
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  // Reorder remaining items
  const remainingItems = await prisma.queueItem.findMany({
    where: { roomId },
    orderBy: { order: 'asc' }
  })

  for (let i = 0; i < remainingItems.length; i++) {
    await prisma.queueItem.update({
      where: { id: remainingItems[i].id },
      data: { order: i }
    })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Only the host can change the current playing index
  const isHost = await prisma.room.findFirst({ where: { id: roomId, hostId: session.user.id }, select: { id: true } })
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
