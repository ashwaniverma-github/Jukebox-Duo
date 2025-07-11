// app/api/rooms/[id]/queue/route.ts
import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'

export async function POST(req: Request,{ params }: { params: { id: string } }) {
  const { id: roomId } =  params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { videoId, title, thumbnail } = await req.json()
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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const items = await prisma.queueItem.findMany({
    where: { roomId: params.id },
    orderBy: { order: 'asc' }
  })
  return NextResponse.json(items)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

  await prisma.queueItem.delete({
    where: { id: itemId }
  })

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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id: roomId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { currentIndex } = await req.json()
  
  // Update room's current playing index
  await prisma.room.update({
    where: { id: roomId },
    data: { currentQueueIndex: currentIndex }
  })
  
  return NextResponse.json({ success: true, currentIndex })
}
