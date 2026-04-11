'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { trackEvent, identifyUser } from '@/components/PostHogProvider'

// Poll premium-status a few times to handle the webhook race:
// browser redirect can arrive before the Dodo webhook finishes processing.
async function verifyPremium(): Promise<boolean> {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await fetch('/api/user/premium-status', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                if (data?.isPremium === true) return true
            }
        } catch {
            // ignore and retry
        }
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1500))
    }
    return false
}

export function PurchaseSuccessTracker() {
    const { data: session, status } = useSession()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const firedRef = useRef(false)

    useEffect(() => {
        if (firedRef.current) return
        if (status !== 'authenticated') return

        const purchase = searchParams.get('purchase')
        if (purchase !== 'success') return

        const type = searchParams.get('type')
        if (type !== 'premium' && type !== 'subscription') return

        const userId = session?.user?.id
        if (!userId) return

        firedRef.current = true

        let cancelled = false

        ;(async () => {
            const verified = await verifyPremium()
            if (cancelled) return
            if (!verified) return

            identifyUser(userId, {
                email: session.user?.email ?? undefined,
                name: session.user?.name ?? undefined,
            })

            if (type === 'premium') {
                trackEvent('payment_succeeded', {
                    plan: 'lifetime',
                    amount: 19,
                    currency: 'USD',
                    $revenue: 19,
                    source: 'client_redirect',
                })
            } else {
                trackEvent('subscription_activated', {
                    plan: 'monthly',
                    amount: 2.99,
                    currency: 'USD',
                    $revenue: 2.99,
                    source: 'client_redirect',
                })
            }

            const next = new URLSearchParams(searchParams.toString())
            next.delete('purchase')
            next.delete('type')
            const qs = next.toString()
            router.replace(qs ? `${pathname}?${qs}` : pathname)
        })()

        return () => {
            cancelled = true
        }
    }, [status, session, searchParams, pathname, router])

    return null
}
