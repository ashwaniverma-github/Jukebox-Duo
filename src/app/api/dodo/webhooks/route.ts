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
            const theme: string = md.theme || 'love';

            if (!userId) {
                console.warn('Webhook payment.succeeded missing userId in metadata');
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { boughtThemes: true },
            });

            if (!user) {
                console.warn('Webhook payment.succeeded user not found', { userId });
                return;
            }

            if (user.boughtThemes.includes(theme)) {
                // already unlocked, no-op (idempotent)
                return;
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    boughtThemes: { set: [...user.boughtThemes, theme] },
                },
            });
        } catch (err) {
            console.error('Error handling onPaymentSucceeded:', err);
        }
    },
    onPayload: async () => {
        // Optional: log or store raw payloads for diagnostics
        return;
    },
});