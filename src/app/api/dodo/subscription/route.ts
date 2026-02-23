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
        const bearerToken = process.env.DODO_PAYMENTS_API_KEY;

        if (!bearerToken) {
            return NextResponse.json({ error: 'Missing DODO_PAYMENTS_API_KEY' }, { status: 500 });
        }

        const productId = process.env.DODO_PREMIUM_PRODUCT_ID_MONTHLY;
        if (!productId) {
            return NextResponse.json({ error: 'Missing DODO_PREMIUM_PRODUCT_ID_MONTHLY' }, { status: 500 });
        }

        const environment =
            process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode';

        const returnBase =
            process.env.DODO_RETURN_URL_BASE ||
            process.env.NEXT_PUBLIC_BASE_URL ||
            'http://localhost:3000';

        let returnUrl = body?.returnUrl;

        if (returnUrl) {
            // Validate return URL to prevent open redirect attacks
            try {
                const parsedUrl = new URL(returnUrl);
                const allowedHosts = new Set([
                    new URL(returnBase).host,
                    'jukeboxduo.com',
                    'www.jukeboxduo.com',
                ]);
                if (!allowedHosts.has(parsedUrl.host)) {
                    return NextResponse.json({ error: 'Invalid return URL' }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ error: 'Invalid return URL format' }, { status: 400 });
            }
            const separator = returnUrl.includes('?') ? '&' : '?';
            returnUrl = `${returnUrl}${separator}purchase=success&type=subscription`;
        } else {
            returnUrl = `${returnBase}?purchase=success&type=subscription`;
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
                type: 'subscription',
                source: 'music-duo',
            },
            subscription_data: {
                trial_period_days: 7,
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
        console.error('Dodo subscription checkout error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}