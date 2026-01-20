import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { boughtThemes: true }
        });

        return NextResponse.json({ boughtThemes: user?.boughtThemes || [] });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { theme } = await req.json();

        if (!theme) {
            return NextResponse.json({ error: 'Theme required' }, { status: 400 });
        }

        // Mock payment verification would go here

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                boughtThemes: {
                    push: theme
                }
            },
            select: { boughtThemes: true }
        });

        return NextResponse.json({ success: true, boughtThemes: user.boughtThemes });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
