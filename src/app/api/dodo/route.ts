import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import DodoPayments from 'dodopayments';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const theme = body?.theme ?? 'love';

        const bearerToken =
            process.env.DODO_PAYMENTS_API_KEY

        if (!bearerToken) {
            return NextResponse.json({ error: 'Missing DODO_PAYMENTS_API_KEY' }, { status: 500 });
        }

        const productId = process.env.DODO_PRODUCT_ID;
        if (!productId) {
            return NextResponse.json({ error: 'Missing DODO_PRODUCT_ID' }, { status: 500 });
        }

        const environment =
            process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode';

        const returnBase =
            process.env.DODO_RETURN_URL_BASE ||
            process.env.NEXT_PUBLIC_BASE_URL ||
            'http://localhost:3000';

        let returnUrl = body?.returnUrl;

        if (returnUrl) {
            // Append success params to client provided URL
            const separator = returnUrl.includes('?') ? '&' : '?';
            returnUrl = `${returnUrl}${separator}purchase=success&theme=${encodeURIComponent(theme)}`;
        } else {
            // Fallback to default base
            returnUrl = `${returnBase}?purchase=success&theme=${encodeURIComponent(theme)}`;
        }

        const client = new DodoPayments({
            bearerToken,
            environment,
        });

        const email = session.user.email || undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const name = (session.user as any).name || undefined;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {
            product_cart: [{ product_id: productId, quantity: 1 }],
            return_url: returnUrl,
            metadata: {
                user_id: session.user.id,
                theme,
                source: 'music-duo',
            },
        };

        if (email) {
            params.customer = name ? { email, name } : { email };
        }

        const sessionResp = await client.checkoutSessions.create(params);

        if (!sessionResp?.checkout_url) {
            return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
        }

        return NextResponse.json({
            checkout_url: sessionResp.checkout_url,
            session_id: sessionResp.session_id,
        });
    } catch (err) {
        console.error('Dodo create checkout error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}