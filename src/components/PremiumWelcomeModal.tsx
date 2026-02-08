'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Heart, MessageSquare, Crown, Music, Zap, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface PremiumWelcomeModalProps {
    isPremium: boolean
}

const SESSION_KEY = 'jukebox_premium_welcome_shown'

export function PremiumWelcomeModal({ isPremium }: PremiumWelcomeModalProps) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!isPremium) return
        let hasShown: string | null = null
        try {
            hasShown = localStorage.getItem(SESSION_KEY)
        } catch {
            // localStorage unavailable (private mode, etc.)
        }
        if (hasShown) return

        const timer = setTimeout(() => {
            setOpen(true)
            try {
                localStorage.setItem(SESSION_KEY, 'true')
            } catch {
                // Ignore storage failures
            }
        }, 1500)

        return () => clearTimeout(timer)
    }, [isPremium])

    if (!isPremium) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[95vw] sm:max-w-[440px] p-0 bg-transparent border-none shadow-none overflow-visible">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative w-full bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden"
                >
                    {/* Premium Mesh Background */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-yellow-500/20 blur-[100px] animate-pulse rounded-full" />
                        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-orange-600/15 blur-[120px] rounded-full" style={{ animationDelay: '1s' }} />
                        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-rose-500/10 blur-[80px] rounded-full" style={{ animationDelay: '2s' }} />

                        {/* Noise Texture Overlays */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.svg')] brightness-100 contrast-150" />
                    </div>

                    <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center">
                        {/* Floating Decorative Elements */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 0.4, 0],
                                        scale: [0, 1, 0],
                                        y: [0, -40 - (i * 10)],
                                        x: [0, (i % 2 === 0 ? 20 : -20)]
                                    }}
                                    transition={{
                                        duration: 3 + i,
                                        repeat: Infinity,
                                        delay: i * 0.5,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute"
                                    style={{
                                        top: '40%',
                                        left: `${20 + (i * 12)}%`,
                                    }}
                                >
                                    {i % 3 === 0 ? <Music className="w-3 h-3 text-yellow-500/50" /> :
                                        i % 3 === 1 ? <Heart className="w-3 h-3 text-rose-500/50" /> :
                                            <Star className="w-2 h-2 text-orange-400/50" />}
                                </motion.div>
                            ))}
                        </div>

                        {/* Top Badge/Icon */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", damping: 12, delay: 0.2 }}
                            className="mb-8"
                        >
                            <div className="relative group">
                                <motion.div
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                    className="relative w-24 h-24 bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.2)]"
                                >
                                    <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />

                                    {/* Rotating Ring */}
                                    <div className="absolute -inset-2 border border-yellow-500/20 rounded-[2.2rem] animate-[spin_10s_linear_infinite]" />
                                </motion.div>

                                {/* Floating Particles */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500/20 rounded-full blur-md"
                                />
                            </div>
                        </motion.div>

                        {/* Text Content */}
                        <div className="text-center space-y-3 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <DialogTitle className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                                    Welcome to Jukebox Premium
                                </DialogTitle>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center justify-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-[0.2em]"
                            >
                                <Zap className="w-3 h-3 fill-current" />
                                <span>UNLIMITED EXPERIENCE UNLOCKED</span>
                                <Zap className="w-3 h-3 fill-current" />
                            </motion.div>
                        </div>

                        {/* Personal Note Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative group hover:bg-white/[0.05] transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">Hey there!</span>
                                        <motion.span
                                            animate={{ rotate: [0, 20, 0, 20, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                            className="text-xl origin-bottom-right"
                                        >
                                            👋
                                        </motion.span>
                                    </div>

                                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed text-left">
                                        It&apos;s <span className="text-white font-semibold">Ashwani</span> here, the builder of Jukebox Duo.
                                        I&apos;m constantly working to make your music sessions more magical.
                                        <span className="block mt-4 text-zinc-300 font-medium italic">Thanks for fueling the dream!</span>
                                    </p>


                                </div>
                            </div>
                        </motion.div>

                        {/* Footer / CTA UI */}
                        <div className="w-full mt-8 space-y-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                <div className="p-1 px-2 rounded-full bg-white/5 border border-white/5 group-hover:border-white/20 transition-all flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-zinc-500 group-hover:text-yellow-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest">Feel free to send any feedback</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={() => setOpen(false)}
                                    className="relative w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-base transition-all group overflow-hidden"
                                >
                                    {/* Shimmer Effect */}
                                    <motion.div
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-[-20deg]"
                                    />

                                    <span className="relative flex items-center justify-center gap-2">
                                        Let&apos;s Play
                                        <Heart className="w-4 h-4 fill-black" />
                                    </span>
                                </Button>
                            </motion.div>

                            <p className="text-[9px] text-zinc-600 text-center uppercase tracking-[0.2em] font-medium">
                                Stay Awesome • Jukebox Duo v2.0
                            </p>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}
