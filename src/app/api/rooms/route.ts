// app/api/rooms/route.ts
import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import jwt from 'jsonwebtoken'

// Helper function to get user ID from either session or JWT token
async function getUserId(req: Request): Promise<string | null> {
  // Check for NextAuth session first (web)
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return session.user.id
  }

  // Check for JWT token (mobile)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const secret = process.env.NEXTAUTH_SECRET || 'your-secret-key'
      const decoded = jwt.verify(token, secret) as { sub: string }
      return decoded.sub
    } catch (error) {
      console.error('JWT verification failed:', error)
      return null
    }
  }

  return null
}

export async function POST(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get session for user details (needed for upsert)
  const session = await getServerSession(authOptions)

  // Ensure user exists in database (handles deleted users)
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: session?.user?.email ?? '',
      name: session?.user?.name,
      image: session?.user?.image,
    },
    update: {},
  })

  const { name } = await req.json()
  const room = await prisma.room.create({
    data: { name, hostId: userId }
  })
  // auto-join host
  await prisma.roomMember.create({
    data: { roomId: room.id, userId }
  })
  return NextResponse.json(room)
}

export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json([], { status: 401 })

  // Verify user exists in DB - if not, return 401 to force signout/re-login methods
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  })

  if (!user) {
    return NextResponse.json({ error: 'User record not found' }, { status: 401 })
  }

  const rooms = await prisma.room.findMany({
    where: { hostId: userId },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(rooms)
}
