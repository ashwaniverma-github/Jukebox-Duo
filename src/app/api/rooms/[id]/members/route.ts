// app/api/rooms/[id]/members/route.ts
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

  // Ensure room exists
  const room = await prisma.room.findUnique({ where: { id: roomId }, select: { id: true } })
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  // List participants (includes host if they joined/auto-joined)
  const members = await prisma.roomMember.findMany({
    where: { roomId },
    select: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { joinedAt: 'asc' },
  })

  const participants = members.map((m) => m.user)
  return NextResponse.json({ members: participants })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Idempotent removal of membership
  try {
    await prisma.roomMember.delete({
      where: {
        roomId_userId: {
          roomId,
          userId: session.user.id,
        },
      },
    })
  } catch {
    // Ignore if membership does not exist
  }
  return NextResponse.json({ success: true })
}


