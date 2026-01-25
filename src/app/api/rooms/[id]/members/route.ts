// app/api/rooms/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { checkRoomAccess } from '../../../../../lib/room-auth'

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

  // Consolidated auth check: 1 query instead of 3
  const { authorized, roomExists } = await checkRoomAccess(roomId, session.user.id)
  if (!roomExists) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // List participants (includes host if they joined/auto-joined)
  const members = await prisma.roomMember.findMany({
    where: { roomId },
    select: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { joinedAt: 'asc' },
  })

  const participants = members.map((m: { user: { id: string; name: string | null; image: string | null } }) => m.user)
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


