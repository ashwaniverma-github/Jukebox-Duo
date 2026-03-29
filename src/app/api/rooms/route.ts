// app/api/rooms/route.ts
import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const userEmail = session.user.email
  if (!userEmail) {
    return NextResponse.json({ error: 'User email required' }, { status: 400 })
  }

  // Ensure user exists in database (handles deleted users)
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: userEmail,
      name: session.user.name,
      image: session.user.image,
    },
    update: {},
  })

  let name: string
  let isEventMode: boolean | undefined
  try {
    const body = await req.json()
    name = body.name
    isEventMode = body.isEventMode
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Room name is required' }, { status: 400 })
  }

  // Event hosting requires an active Event Pro subscription ($9.99/mo)
  // Lifetime users get core premium features but NOT event hosting
  if (isEventMode) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    })
    const canHostEvents = user?.subscriptionTier === 'event_pro'
    if (!canHostEvents) {
      return NextResponse.json({
        error: 'Event hosting requires Event Pro subscription',
        isPremiumRequired: true,
        requiredTier: 'event_pro'
      }, { status: 403 })
    }
  }

  const room = await prisma.room.create({
    data: {
      name,
      hostId: userId,
      isEventMode: isEventMode || false,
      eventToken: isEventMode ? crypto.randomUUID() : null,
    }
  })
  // auto-join host
  await prisma.roomMember.create({
    data: { roomId: room.id, userId }
  })
  return NextResponse.json(room)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const userId = session.user.id

  // Verify user exists in DB - if not, return 401 to force signout/re-login
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  })

  if (!user) {
    return NextResponse.json({ error: 'User record not found' }, { status: 401 })
  }

  const rooms = await prisma.room.findMany({
    where: { hostId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      createdAt: true,
      isEventMode: true,
      eventToken: true,
    }
  })
  return NextResponse.json(rooms)
}
