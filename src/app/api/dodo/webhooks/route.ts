export const runtime = 'nodejs';

import { Webhooks } from '@dodopayments/nextjs';
import prisma from '@/lib/prisma';

// Helper utilities for subscription events


function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null;
}

function getPayloadData(payload: unknown): Record<string, unknown> {
    if (isRecord(payload)) {
        const maybeData = payload['data'];
        if (isRecord(maybeData)) {
            return maybeData as Record<string, unknown>;
        }
    }
    return {};
}

function getMetadata(data: Record<string, unknown>): Record<string, unknown> {
    const md = data['metadata'];
    return isRecord(md) ? (md as Record<string, unknown>) : {};
}

function getString(obj: Record<string, unknown>, key: string): string | undefined {
    const v = obj[key];
    return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function pickFirstString(obj: Record<string, unknown>, keys: string[]): string | undefined {
    for (const k of keys) {
        const v = getString(obj, k);
        if (v) return v;
    }
    return undefined;
}

function getNestedCustomerEmail(data: Record<string, unknown>): string | undefined {
    const customer = data['customer'];
    if (isRecord(customer)) {
        const emailVal = customer['email'];
        if (typeof emailVal === 'string' && emailVal.length > 0) return emailVal;
    }
    const email1 = getString(data, 'customer_email');
    if (email1) return email1;
    const email2 = getString(data, 'email');
    if (email2) return email2;
    return undefined;
}

async function resolveUserIdFromPayload(payload: unknown): Promise<string | undefined> {
    const data = getPayloadData(payload);
    const md = getMetadata(data);
    const metaUserId = pickFirstString(md, ['user_id', 'userId', 'uid', 'user']);
    if (metaUserId) return metaUserId;

    const email = getNestedCustomerEmail(data);
    if (email) {
        const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        return user?.id;
    }
    return undefined;
}

function parseCurrentPeriodEnd(data: Record<string, unknown>): Date | undefined {
    const raw =
        data['current_period_end'] ??
        data['currentPeriodEnd'] ??
        data['next_billing_date'] ??
        data['nextBillingDate'];

    if (raw == null) return undefined;
    if (typeof raw === 'number') return new Date(raw * 1000);
    if (typeof raw === 'string') return new Date(raw);
    return undefined;
}

function extractSubscriptionId(data: Record<string, unknown>): string | undefined {
    return (
        getString(data, 'subscription_id') ??
        getString(data, 'subscriptionId') ??
        getString(data, 'id')
    );
}

function extractProductId(data: Record<string, unknown>): string | undefined {
    const pid =
        getString(data, 'product_id') ??
        getString(data, 'productId') ??
        process.env.DODO_PREMIUM_PRODUCT_ID_MONTHLY;
    return pid ?? undefined;
}

function isLifetimeProduct(data: Record<string, unknown>): boolean {
    const md = getMetadata(data);
    const productId = extractProductId(data);
    const lifetimeId = process.env.DODO_PREMIUM_PRODUCT_ID;
    const type =
        pickFirstString(md, ['type', 'purchase_type', 'kind']) ?? getString(data, 'type');
    return Boolean((type && type.toLowerCase() === 'premium') || (lifetimeId && productId === lifetimeId));
}

function getEventType(payload: unknown): string | undefined {
    if (isRecord(payload)) {
        const t1 = payload['type'];
        if (typeof t1 === 'string' && t1) return t1;
        const t2 = payload['event'];
        if (typeof t2 === 'string' && t2) return t2;
        const t3 = payload['name'];
        if (typeof t3 === 'string' && t3) return t3;
    }
    const data = getPayloadData(payload);
    return getString(data, 'type');
}


export const POST = Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
    onPaymentSucceeded: async (payload) => {
        try {
            const data = getPayloadData(payload);
            const md = getMetadata(data);
            const userId = await resolveUserIdFromPayload(payload);
            const purchaseType: string = getString(md, 'type') || getString(data, 'type') || 'premium';

            if (!userId) {
                console.warn('Webhook payment.succeeded missing userId in metadata');
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { boughtThemes: true, isPremium: true },
            });

            if (!user) {
                console.warn('Webhook payment.succeeded user not found', { userId });
                return;
            }

            // Handle premium lifetime purchase
            if (purchaseType === 'premium') {
                // Already premium - idempotent check
                if (user.isPremium) {
                    console.log('User already premium, skipping update', { userId });
                    return;
                }

                // Add love theme if not already owned
                const newBoughtThemes = user.boughtThemes.includes('love')
                    ? user.boughtThemes
                    : [...user.boughtThemes, 'love'];

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        isPremium: true,
                        premiumPurchasedAt: new Date(),
                        boughtThemes: { set: newBoughtThemes },
                    },
                });

                console.log('Successfully activated lifetime premium for user', { userId });
            }
        } catch (err) {
            console.error('Error handling onPaymentSucceeded:', err);
        }
    },

    // Subscription Webhook Handlers
    onSubscriptionActive: async (payload) => {
        try {
            const userId = await resolveUserIdFromPayload(payload);
            if (!userId) {
                console.warn('Webhook subscription.active missing userId mapping');
                return;
            }
            const data = getPayloadData(payload);
            const subscriptionId = extractSubscriptionId(data) ?? `${userId}-${Date.now()}`;
            const productId = extractProductId(data) ?? 'unknown';
            const currentPeriodEnd = parseCurrentPeriodEnd(data);

            if (isLifetimeProduct(data)) {
                console.log('Skipping subscription.active for lifetime product', { userId, productId });
                return;
            }

            await prisma.subscription.upsert({
                where: { userId },
                update: {
                    subscriptionId,
                    productId,
                    status: 'active',
                    currentPeriodEnd,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    subscriptionId,
                    productId,
                    status: 'active',
                    currentPeriodEnd,
                },
            });

            const userThemes = await prisma.user.findUnique({
                where: { id: userId },
                select: { boughtThemes: true },
            });
            const updatedThemes =
                userThemes?.boughtThemes?.includes('love')
                    ? userThemes.boughtThemes
                    : [...(userThemes?.boughtThemes ?? []), 'love'];

            await prisma.user.update({
                where: { id: userId },
                data: {
                    isPremium: true,
                    boughtThemes: { set: updatedThemes },
                },
            });

            console.log('Handled subscription.active', { userId, subscriptionId });
        } catch (err) {
            console.error('Error handling onSubscriptionActive:', err);
        }
    },
    onSubscriptionRenewed: async (payload) => {
        try {
            const userId = await resolveUserIdFromPayload(payload);
            if (!userId) return;

            const data = getPayloadData(payload);
            const subscriptionId = extractSubscriptionId(data) ?? `${userId}-${Date.now()}`;
            const productId = extractProductId(data) ?? 'unknown';
            const currentPeriodEnd = parseCurrentPeriodEnd(data);

            if (isLifetimeProduct(data)) {
                console.log('Skipping subscription.renewed for lifetime product', { userId, productId });
                return;
            }

            await prisma.subscription.upsert({
                where: { userId },
                update: {
                    subscriptionId,
                    productId,
                    status: 'active',
                    currentPeriodEnd,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    subscriptionId,
                    productId,
                    status: 'active',
                    currentPeriodEnd,
                },
            });

            const userThemes = await prisma.user.findUnique({
                where: { id: userId },
                select: { boughtThemes: true },
            });
            const updatedThemes =
                userThemes?.boughtThemes?.includes('love')
                    ? userThemes.boughtThemes
                    : [...(userThemes?.boughtThemes ?? []), 'love'];

            await prisma.user.update({
                where: { id: userId },
                data: {
                    isPremium: true,
                    boughtThemes: { set: updatedThemes },
                },
            });

            console.log('Handled subscription.renewed', { userId, subscriptionId });
        } catch (err) {
            console.error('Error handling onSubscriptionRenewed:', err);
        }
    },
    onSubscriptionCancelled: async (payload) => {
        try {
            const userId = await resolveUserIdFromPayload(payload);
            if (!userId) return;

            const data = getPayloadData(payload);
            const subscriptionId = extractSubscriptionId(data) ?? `${userId}-${Date.now()}`;
            const productId = extractProductId(data) ?? 'unknown';
            const currentPeriodEnd = parseCurrentPeriodEnd(data);

            if (isLifetimeProduct(data)) {
                console.log('Skipping subscription.cancelled for lifetime product', { userId, productId });
                return;
            }

            await prisma.subscription.upsert({
                where: { userId },
                update: {
                    subscriptionId,
                    productId,
                    status: 'cancelled',
                    currentPeriodEnd,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    subscriptionId,
                    productId,
                    status: 'cancelled',
                    currentPeriodEnd,
                },
            });

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { premiumPurchasedAt: true, boughtThemes: true },
            });
            if (!user?.premiumPurchasedAt) {
                const filtered = (user?.boughtThemes ?? []).filter((t) => t !== 'love');
                await prisma.user.update({
                    where: { id: userId },
                    data: { isPremium: false, boughtThemes: { set: filtered } },
                });
            }

            console.log('Handled subscription.cancelled', { userId, subscriptionId });
        } catch (err) {
            console.error('Error handling onSubscriptionCancelled:', err);
        }
    },
    onSubscriptionOnHold: async (payload) => {
        try {
            const userId = await resolveUserIdFromPayload(payload);
            if (!userId) return;

            const data = getPayloadData(payload);
            const subscriptionId = extractSubscriptionId(data) ?? `${userId}-${Date.now()}`;
            const productId = extractProductId(data) ?? 'unknown';
            const currentPeriodEnd = parseCurrentPeriodEnd(data);

            if (isLifetimeProduct(data)) {
                console.log('Skipping subscription.on_hold for lifetime product', { userId, productId });
                return;
            }

            await prisma.subscription.upsert({
                where: { userId },
                update: {
                    subscriptionId,
                    productId,
                    status: 'on_hold',
                    currentPeriodEnd,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    subscriptionId,
                    productId,
                    status: 'on_hold',
                    currentPeriodEnd,
                },
            });

            console.log('Handled subscription.on_hold', { userId, subscriptionId });
        } catch (err) {
            console.error('Error handling onSubscriptionOnHold:', err);
        }
    },
    onSubscriptionExpired: async (payload) => {
        try {
            const userId = await resolveUserIdFromPayload(payload);
            if (!userId) return;

            const data = getPayloadData(payload);
            const subscriptionId = extractSubscriptionId(data) ?? `${userId}-${Date.now()}`;
            const productId = extractProductId(data) ?? 'unknown';
            const currentPeriodEnd = parseCurrentPeriodEnd(data);

            if (isLifetimeProduct(data)) {
                console.log('Skipping subscription.expired for lifetime product', { userId, productId });
                return;
            }

            await prisma.subscription.upsert({
                where: { userId },
                update: {
                    subscriptionId,
                    productId,
                    status: 'expired',
                    currentPeriodEnd,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    subscriptionId,
                    productId,
                    status: 'expired',
                    currentPeriodEnd,
                },
            });

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { premiumPurchasedAt: true, boughtThemes: true },
            });
            if (!user?.premiumPurchasedAt) {
                const filtered = (user?.boughtThemes ?? []).filter((t) => t !== 'love');
                await prisma.user.update({
                    where: { id: userId },
                    data: { isPremium: false, boughtThemes: { set: filtered } },
                });
            }

            console.log('Handled subscription.expired', { userId, subscriptionId });
        } catch (err) {
            console.error('Error handling onSubscriptionExpired:', err);
        }
    },

    onPayload: async (payload) => {
        try {
            const type: string | undefined = getEventType(payload);
            const data = getPayloadData(payload);

            const subscriptionId: string | undefined = extractSubscriptionId(data);

            const currentPeriodEnd = parseCurrentPeriodEnd(data);

            const md = getMetadata(data);
            let userId: string | undefined =
                pickFirstString(md, ['user_id', 'userId', 'uid', 'user']);

            if (!userId) {
                userId = await resolveUserIdFromPayload(payload);
            }
            if (!userId && subscriptionId) {
                const existing = await prisma.subscription.findUnique({
                    where: { subscriptionId },
                    select: { userId: true },
                });
                userId = existing?.userId;
            }

            if (!userId && !subscriptionId && (type?.startsWith('subscription.') || type?.startsWith('invoice.'))) {
                console.warn('Webhook payload missing resolvable user; skipping', { type });
                return;
            }

            // Subscription events are handled by specific handlers above. Skip here to avoid double-processing.
            if (type?.startsWith('subscription.')) {
                return;
            }

            // Invoice events can refresh period end dates
            if (type === 'invoice.payment_succeeded' || type === 'invoice.paid') {
                if (currentPeriodEnd) {
                    if (userId) {
                        await prisma.subscription.updateMany({
                            where: { userId },
                            data: { currentPeriodEnd, updatedAt: new Date() },
                        });
                    } else if (subscriptionId) {
                        await prisma.subscription.update({
                            where: { subscriptionId },
                            data: { currentPeriodEnd, updatedAt: new Date() },
                        });
                    }
                    console.log('Updated subscription period end from invoice event', {
                        userId,
                        subscriptionId,
                        currentPeriodEnd,
                    });
                }
                return;
            }

            // Other events: ignore safely
            console.log('Unhandled webhook event type', { type });
            return;
        } catch (err) {
            console.error('Error handling onPayload:', err);
        }
    },
});