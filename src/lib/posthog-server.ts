import { PostHog } from 'posthog-node'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

// Singleton - null if env vars missing (no-op mode)
const posthog = key && host ? new PostHog(key, { host, flushAt: 1, flushInterval: 0 }) : null

/**
 * Fire-and-forget server-side PostHog tracking.
 * NEVER throws - analytics must never break payments.
 *
 * Edge cases handled:
 * - Missing env vars: no-op
 * - PostHog API failure: caught and logged
 * - Serverless cold exit: flushAt=1 forces immediate send, awaited flush
 * - Network timeout: 5s hard timeout via Promise.race
 */
export async function trackServerEvent(
    distinctId: string,
    event: string,
    properties?: Record<string, unknown>
): Promise<void> {
    if (!posthog) return
    if (!distinctId) {
        console.warn('PostHog: trackServerEvent called without distinctId, skipping', { event })
        return
    }

    try {
        posthog.capture({ distinctId, event, properties })

        // Race flush against a timeout so a slow PostHog never holds up the webhook response
        await Promise.race([
            posthog.flush(),
            new Promise((resolve) => setTimeout(resolve, 5000)),
        ])
    } catch (err) {
        console.warn('PostHog server tracking failed (non-fatal):', err)
    }
}
