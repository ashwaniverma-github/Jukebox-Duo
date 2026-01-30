export const runtime = 'nodejs';

import { Webhooks } from '@dodopayments/nextjs';
import prisma from '@/lib/prisma';

export const POST = Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onPaymentSucceeded: async (payload: any) => {
        try {
            const data = payload?.data ?? payload ?? {};
            const md = data?.metadata ?? {};
            const userId: string | undefined =
                md.user_id || md.userId || md.uid || md.user || undefined;
            const purchaseType: string = md.type || 'premium';

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

            // Handle premium purchase
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

                console.log('Successfully activated premium for user', { userId });
            }
        } catch (err) {
            console.error('Error handling onPaymentSucceeded:', err);
        }
    },
    onPayload: async () => {
        // Optional: log or store raw payloads for diagnostics
        return;
    },
});