'use client'
import { SessionProvider } from "next-auth/react"
import { PostHogProvider } from "@/components/PostHogProvider"

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return <div>
        <PostHogProvider>
            <SessionProvider>
                {children}
            </SessionProvider>
        </PostHogProvider>
    </div>
}