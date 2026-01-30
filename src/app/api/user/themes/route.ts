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
            select: { boughtThemes: true, isPremium: true }
        });

        // Premium users automatically get love theme
        let boughtThemes = user?.boughtThemes || ['default'];
        const isPremium = user?.isPremium || false;

        if (isPremium && !boughtThemes.includes('love')) {
            boughtThemes = [...boughtThemes, 'love'];
        }

        return NextResponse.json({
            boughtThemes,
            isPremium
        });
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

        // Check if user is premium - they already have love theme
        const existingUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isPremium: true, boughtThemes: true }
        });

        if (existingUser?.isPremium && theme === 'love') {
            // Premium users already have love theme, just return success
            return NextResponse.json({
                success: true,
                boughtThemes: existingUser.boughtThemes.includes('love')
                    ? existingUser.boughtThemes
                    : [...existingUser.boughtThemes, 'love']
            });
        }

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
