// app/api/rooms/route.ts
import { NextResponse } from 'next/server'
import  prisma  from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.error()
  const { name } = await req.json()
  const room = await prisma.room.create({
    data: { name, hostId: session.user.id }
  })
  // auto-join host
  await prisma.roomMember.create({
    data: { roomId: room.id, userId: session.user.id }
  })
  return NextResponse.json(room)
}

export async function GET() {
  const rooms = await prisma.room.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(rooms)
}
