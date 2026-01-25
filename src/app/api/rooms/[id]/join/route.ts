// src/app/api/rooms/[id]/join/route.ts
import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params before using
  const { id: roomId } = await params

  // Authenticate
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // Validate room exists
  const room = await prisma.room.findUnique({ where: { id: roomId }, select: { id: true } })
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

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

  // Upsert membership
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

  return NextResponse.json({ ok: true })
} 
