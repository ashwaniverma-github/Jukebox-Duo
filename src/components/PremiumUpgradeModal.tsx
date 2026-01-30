'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Loader2, Crown, Check, Sparkles, Music, Users, Heart, ShieldCheck, Lock } from 'lucide-react'

interface PremiumUpgradeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    trigger?: 'queue_limit' | 'sync_limit' | 'general'
    onSuccess?: () => void
}

export function PremiumUpgradeModal({ open, onOpenChange, trigger = 'general' }: PremiumUpgradeModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handlePurchase = async () => {
        setLoading(true)
        setError('')
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
            <DialogContent className="w-[95vw] sm:max-w-[400px] p-0 bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header Section */}
                <div className="relative p-3 sm:p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800/50">
                    <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                            <div className="relative w-12 sm:w-16 h-12 sm:h-16 bg-zinc-900 rounded-xl sm:rounded-2xl border border-zinc-700 flex items-center justify-center shadow-inner">
                                <Crown className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-500" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-semibold tracking-tight">
                                Upgrade to Premium
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                {getTriggerMessage()}
                            </DialogDescription>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm line-through text-zinc-500 font-medium">$12.99</span>
                                <span className="text-3xl font-bold text-white">$5.99</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                                <Sparkles className="w-3 h-3 text-rose-500" />
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Limited Time Deal</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="p-3 sm:p-6 space-y-2.5 sm:space-y-4">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:border-zinc-700 transition-colors">
                                <feature.icon className="w-4 h-4 text-zinc-400 group-hover:text-yellow-500 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-200">{feature.label}</p>
                                <p className="text-xs text-zinc-500">{feature.desc}</p>
                            </div>
                            <Check className="w-4 h-4 text-emerald-500 mt-1" />
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="p-3 sm:p-6 pt-2 bg-zinc-950/50">
                    <Button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Get Lifetime Access"
                        )}
                    </Button>

                    <div className="mt-3 sm:mt-4 flex flex-col items-center space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                            <Lock className="w-3 h-3" />
                            Secure Checkout
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">
                            <ShieldCheck className="w-3 h-3" />
                            100% Satisfaction Guarantee
                        </div>
                    </div>

                    {error && <p className="mt-2 text-xs text-red-400 text-center">{error}</p>}

                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-full mt-4 text-xs text-zinc-500 hover:text-zinc-600 transition-colors"
                    >
                        No thanks, maybe later
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
