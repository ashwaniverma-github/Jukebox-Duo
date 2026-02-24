'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from './ui/dialog'
import { MonitorPlay } from 'lucide-react'

export function DesktopExperienceModal() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // Only show once ever (persists across browser restarts via localStorage)
        const hasSeenModal = localStorage.getItem('desktop-modal-shown')
        if (hasSeenModal) return

        // Detect non-desktop devices (screen width < 1024px)
        const isMobile = window.innerWidth < 1024
        if (isMobile) {
            // Small delay so it doesn't flash immediately on load
            const timer = setTimeout(() => {
                setOpen(true)
                localStorage.setItem('desktop-modal-shown', 'true')
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    if (!open) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="w-[85vw] sm:max-w-[320px] p-6 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 text-zinc-100 shadow-2xl rounded-3xl"
                showCloseButton={false}
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-zinc-900/80 rounded-full border border-zinc-800/50 flex items-center justify-center shadow-inner">
                        <MonitorPlay className="w-6 h-6 text-zinc-400" />
                    </div>

                    <p className="text-base text-zinc-200 font-medium">
                        For the best experience, use a desktop or laptop
                    </p>

                    <button
                        onClick={() => setOpen(false)}
                        className="mt-2 w-full h-10 rounded-full bg-zinc-100 text-zinc-900 font-semibold text-sm hover:bg-white transition-all active:scale-[0.98]"
                    >
                        Okay
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
