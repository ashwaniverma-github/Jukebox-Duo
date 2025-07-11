// src/app/api/rooms/[id]/join/route.ts
import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
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

  // Upsert membership
  await prisma.roomMember.upsert({
    where: {
      roomId_userId: {
        roomId,                     // use awaited roomId
        userId: session.user.id,    // now defined
      },
    },
    create: {
      roomId,                      // use awaited roomId
      userId: session.user.id,     // now defined
    },
    update: {},
  })

  return NextResponse.json({ ok: true })
}
