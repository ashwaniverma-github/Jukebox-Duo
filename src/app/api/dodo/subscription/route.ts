import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import DodoPayments from 'dodopayments';
import prisma from '@/lib/prisma';

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

        // Support tier selection: "premium" ($2.99/mo) or "event_pro" ($9.99/mo)
        const tier = body?.tier === 'event_pro' ? 'event_pro' : 'premium';
        const productId = tier === 'event_pro'
            ? process.env.DODO_EVENT_PRO_PRODUCT_ID_MONTHLY
            : process.env.DODO_PREMIUM_PRODUCT_ID_MONTHLY;
        if (!productId) {
            return NextResponse.json({ error: `Missing product ID for ${tier}` }, { status: 500 });
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

        // Check for existing active subscription — upgrade/downgrade via changePlan
        const existingSub = await prisma.subscription.findUnique({
            where: { userId: session.user.id },
            select: { subscriptionId: true, productId: true, status: true },
        });

        if (existingSub?.status === 'active' || existingSub?.status === 'trialing') {
            if (existingSub.productId === productId) {
                return NextResponse.json({ error: 'You are already on this plan' }, { status: 400 });
            }

            if (!existingSub.subscriptionId) {
                return NextResponse.json({ error: 'Subscription ID missing, please contact support' }, { status: 500 });
            }

            // Upgrade or downgrade in-place — prorated charge/credit immediately
            await client.subscriptions.changePlan(existingSub.subscriptionId, {
                product_id: productId,
                proration_billing_mode: 'prorated_immediately',
                quantity: 1,
            });

            // Optimistic local DB update — webhook will confirm shortly
            await prisma.$transaction([
                prisma.subscription.update({
                    where: { userId: session.user.id },
                    data: { productId, updatedAt: new Date() },
                }),
                prisma.user.update({
                    where: { id: session.user.id },
                    data: { subscriptionTier: tier, isPremium: true },
                }),
            ]);

            return NextResponse.json({ plan_changed: true, new_tier: tier });
        }

        // No active subscription — create new checkout session
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
                tier,
                source: 'jukebox-duo',
            },
            subscription_data: {
                trial_period_days: 0,
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