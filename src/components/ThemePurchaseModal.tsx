import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Loader2, Heart, Sparkles, Check } from 'lucide-react'

interface ThemePurchaseModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function ThemePurchaseModal({ open, onOpenChange }: ThemePurchaseModalProps) {
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
                    theme: 'love',
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-pink-950 via-gray-900 to-black border-pink-500/20 text-white overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]" />
                </div>

                <DialogHeader className="relative z-10 text-center space-y-4 pt-6">
                    <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                        <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
                    </div>

                    <div>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-rose-300">
                            Unlock Love Theme
                        </DialogTitle>
                        <DialogDescription className="text-pink-200/60 mt-2">
                            Get our exclusive romantic theme for your room
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="relative z-10 py-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                            "Floating Hearts",
                            "Romantic Colors",
                            "Starry Background",
                            "Premium Badges"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 rounded-lg p-2 border border-white/5">
                                <Check className="w-4 h-4 text-pink-500" />
                                {feature}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-end justify-center gap-1.5 pb-2">
                        <span className="text-4xl font-bold text-white">$5.99</span>
                        <span className="text-gray-400 mb-1.5">/ one-time</span>
                    </div>
                </div>

                <DialogFooter className="relative z-10 flex-col gap-3 sm:flex-col">
                    <Button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full h-12 text-lg bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 border-0 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Purchase Now <Sparkles className="ml-2 w-5 h-5" />
                            </>
                        )}
                    </Button>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <p className="text-xs text-center text-gray-500 mt-2">
                        Secure payment • Instant unlock • Lifetime access
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
