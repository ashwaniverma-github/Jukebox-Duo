'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Only initialize PostHog in the browser
        if (typeof window !== 'undefined' && !posthog.__loaded) {
            const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
            const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

            if (posthogKey && posthogHost) {
                posthog.init(posthogKey, {
                    api_host: posthogHost,
                    capture_pageview: true,
                    capture_pageleave: true,
                    // Enable session recording if needed
                    // autocapture: true,
                    person_profiles: 'identified_only',
                })
            }
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}

// Track button click events
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
        posthog.capture(eventName, properties)
    }
}

// Track Premium Upgrade Modal opening
export const trackPremiumModalOpen = (trigger: 'queue_limit' | 'sync_limit' | 'general', location: string = 'room') => {
    trackEvent('premium_modal_opened', {
        trigger,
        location,
    })
}

// Track Premium Purchase Button Click
export const trackPremiumPurchaseClick = (plan: 'monthly' | 'lifetime', trigger: 'queue_limit' | 'sync_limit' | 'general') => {
    trackEvent('premium_purchase_clicked', {
        plan,
        trigger,
        location: 'room',
    })
}

// Identify user for active user tracking
export const identifyUser = (userId: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
        posthog.identify(userId, properties)
    }
}

// Track room join for active users
export const trackRoomJoin = (roomId: string) => {
    trackEvent('room_joined', {
        room_id: roomId,
    })
}
