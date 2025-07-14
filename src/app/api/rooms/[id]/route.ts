import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const room = await prisma.room.findUnique({
    where: { id: params.id },
    include: { host: { select: { name: true, email: true, id: true } } },
  });
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  return NextResponse.json({
    id: room.id,
    name: room.name,
    host: room.host ? { name: room.host.name, email: room.host.email, id: room.host.id } : null,
    createdAt: room.createdAt,
  });
} 