'use client'
import { Suspense } from "react"
import { SessionProvider } from "next-auth/react"
import { PostHogProvider } from "@/components/PostHogProvider"
import { PurchaseSuccessTracker } from "@/components/PurchaseSuccessTracker"

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return <div>
        <PostHogProvider>
            <SessionProvider>
                <Suspense fallback={null}>
                    <PurchaseSuccessTracker />
                </Suspense>
                {children}
            </SessionProvider>
        </PostHogProvider>
    </div>
}