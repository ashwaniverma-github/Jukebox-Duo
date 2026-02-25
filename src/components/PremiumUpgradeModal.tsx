'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Loader2, Crown, Check, Sparkles, Music, Users, Heart, ShieldCheck, Lock } from 'lucide-react'
import { cn } from '../lib/utils'
import { trackPremiumModalOpen, trackPremiumPurchaseClick } from './PostHogProvider'

interface PremiumUpgradeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    trigger?: 'queue_limit' | 'sync_limit' | 'general'
}

export function PremiumUpgradeModal({ open, onOpenChange, trigger = 'general' }: PremiumUpgradeModalProps) {
    const [loading, setLoading] = useState(false)
    const [subLoading, setSubLoading] = useState(false)
    const [error, setError] = useState('')
    const [plan, setPlan] = useState<'monthly' | 'lifetime'>('monthly')

    // Track when modal opens
    useEffect(() => {
        if (open) {
            trackPremiumModalOpen(trigger, 'room')
        }
    }, [open, trigger])

    const handlePurchase = async () => {
        setLoading(true)
        setError('')
        trackPremiumPurchaseClick('lifetime', trigger)
        try {
            const res = await fetch('/api/dodo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    returnUrl: window.location.href
                })
            })

            if (!res.ok) throw new Error('Failed to create checkout session')

            const data = await res.json()
            if (!data?.checkout_url) throw new Error('Missing checkout URL')

            onOpenChange(false)
            window.location.href = data.checkout_url
        } catch (err) {
            setError('Something went wrong. Please try again.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubscribe = async () => {
        setSubLoading(true)
        setError('')
        trackPremiumPurchaseClick('monthly', trigger)
        try {
            const res = await fetch('/api/dodo/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    returnUrl: window.location.href
                })
            })

            if (!res.ok) throw new Error('Failed to create subscription checkout')

            const data = await res.json()
            if (!data?.checkout_url) throw new Error('Missing checkout URL')

            onOpenChange(false)
            window.location.href = data.checkout_url
        } catch (err) {
            setError('Something went wrong. Please try again.')
            console.error(err)
        } finally {
            setSubLoading(false)
        }
    }

    const action = plan === 'lifetime' ? handlePurchase : handleSubscribe
    const isProcessing = loading || subLoading

    const getTriggerMessage = () => {
        switch (trigger) {
            case 'queue_limit':
                return "You've reached the free queue limit of 5 songs."
            case 'sync_limit':
                return "Real-time sync is a premium feature."
            default:
                return "Unlock the full Jukebox Duo experience."
        }
    }

    const features = [
        { icon: Music, label: "Unlimited Queue", desc: "Add as many songs as you want" },
        { icon: Music, label: "Import playlist", desc: "Bulk add songs from youtube playlist" },
        { icon: Users, label: "Real-time Sync", desc: "Listen together with friends" },
        { icon: Heart, label: "Love Theme", desc: "Perfect for couples 💕" },
        { icon: Sparkles, label: "Pro Badge", desc: "Stand out in every room" },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[400px] p-0 bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Header Section */}
                <div className="relative p-3 sm:p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800/50">
                    <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                            <div className="relative w-10 sm:w-16 h-10 sm:h-16 bg-zinc-900 rounded-xl sm:rounded-2xl border border-zinc-700 flex items-center justify-center shadow-inner">
                                <Crown className="w-5 sm:w-8 h-5 sm:h-8 text-yellow-500" />
                            </div>
                        </div>

                        <div className="space-y-0.5 sm:space-y-1">
                            <DialogTitle className="text-lg sm:text-xl font-semibold tracking-tight">
                                Upgrade to Premium
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm text-zinc-400">
                                {getTriggerMessage()}
                            </DialogDescription>
                        </div>

                        {/* Plan Toggle */}
                        <div className="flex items-center gap-3 p-1 bg-zinc-900/50 border border-zinc-800 rounded-full">
                            <button
                                onClick={() => setPlan('monthly')}
                                disabled={isProcessing}
                                className={cn(
                                    "relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
                                    plan === 'monthly' ? "bg-white text-black shadow-lg ring-1 ring-white/20" : "text-zinc-500 hover:text-zinc-300",
                                    isProcessing && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                Monthly
                                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[8px] text-white font-bold tracking-tighter shadow-xl ring-2 ring-zinc-950">
                                    TRY FREE
                                </span>
                            </button>
                            <button
                                onClick={() => setPlan('lifetime')}
                                disabled={isProcessing}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
                                    plan === 'lifetime' ? "bg-white text-black shadow-lg ring-1 ring-white/20" : "text-zinc-500 hover:text-zinc-300",
                                    isProcessing && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                Lifetime
                            </button>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <div className="flex items-center gap-2">
                                {plan === 'lifetime' ? (
                                    <>
                                        <span className="text-sm line-through text-zinc-500 font-medium">$49.99</span>
                                        <span className="text-2xl sm:text-3xl font-bold text-white">$12.99</span>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl sm:text-3xl font-bold text-white">$0</span>
                                            <span className="text-xs sm:text-sm font-medium text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider">
                                                Free for 7 days
                                            </span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">Then $3.99/mo • Cancel anytime</span>
                                    </div>
                                )}
                            </div>
                            {plan === 'lifetime' && (
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">

                                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Limited Time Deal</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 animate-pulse">
                                        <span>🔥 Only 2 spots remaining!</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="px-4 sm:px-6 py-2 sm:py-4 space-y-1.5 sm:space-y-4">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center sm:items-start gap-3 group">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:border-zinc-700 transition-colors">
                                <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 group-hover:text-yellow-500 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-zinc-200">{feature.label}</p>
                                <p className="text-xs text-zinc-500">{feature.desc}</p>
                            </div>
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="px-4 sm:px-6 pb-3 sm:pb-6 pt-0 bg-zinc-950/50">
                    <div className="space-y-2">
                        <Button
                            onClick={action}
                            disabled={isProcessing}
                            className="w-full h-10 sm:h-11 bg-white text-black hover:bg-zinc-200 font-medium transition-all text-sm"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                plan === 'lifetime' ? (
                                    "Get Lifetime Access"
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Start 7-Day Free Trial
                                    </span>
                                )
                            )}
                        </Button>
                    </div>

                    <div className="mt-1.5 sm:mt-4 flex flex-col items-center space-y-1 sm:space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                            <Lock className="w-3 h-3" />
                            Secure Checkout
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">
                            <ShieldCheck className="w-3 h-3" />
                            100% Satisfaction Guarantee
                        </div>
                    </div>

                    {error && <p className="mt-1 text-xs text-red-400 text-center">{error}</p>}

                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-full mt-2 sm:mt-4 pb-3 text-xs text-zinc-500 hover:text-zinc-600 transition-colors"
                    >
                        No thanks, maybe later
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
