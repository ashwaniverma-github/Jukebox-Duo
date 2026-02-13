import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import DodoPayments from 'dodopayments';

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get the user's dodoCustomerId
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { dodoCustomerId: true, isPremium: true },
        });

        if (!user?.isPremium) {
            return NextResponse.json(
                { error: 'Customer portal is only available for premium users' },
                { status: 403 }
            );
        }

        if (!user.dodoCustomerId) {
            return NextResponse.json(
                { error: 'No Dodo customer ID found. Please contact support.' },
                { status: 404 }
            );
        }

        const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
        if (!bearerToken) {
            return NextResponse.json({ error: 'Missing DODO_PAYMENTS_API_KEY' }, { status: 500 });
        }

        const environment =
            process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode';

        const client = new DodoPayments({ bearerToken, environment });

        // Create a customer portal session
        const portalSession = await client.customers.customerPortal.create(
            user.dodoCustomerId,
            { send_email: false }
        );

        if (!portalSession?.link) {
            return NextResponse.json(
                { error: 'Failed to create customer portal session' },
                { status: 500 }
            );
        }

        return NextResponse.json({ link: portalSession.link });
    } catch (err) {
        console.error('Error creating customer portal session:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
