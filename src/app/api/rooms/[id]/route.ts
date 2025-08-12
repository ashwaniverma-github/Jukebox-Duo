import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession({ req, ...authOptions });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const room = await prisma.room.findUnique({
    where: { id },
    include: { host: { select: { name: true, id: true } } },
  });
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }
  return NextResponse.json({
    id: room.id,
    name: room.name,
    host: room.host
      ? { name: room.host.name, id: room.host.id }
      : null,
    createdAt: room.createdAt,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession({ req, ...authOptions });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // Check if the room exists and the user is the host
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }
  if (room.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  // Delete related queue items and room members for cleanup
  await prisma.queueItem.deleteMany({ where: { roomId: id } });
  await prisma.roomMember.deleteMany({ where: { roomId: id } });
  await prisma.room.delete({ where: { id } });
  return NextResponse.json({ success: true });
}