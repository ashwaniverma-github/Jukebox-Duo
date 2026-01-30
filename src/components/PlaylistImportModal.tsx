'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ListMusic, Loader2, Link as LinkIcon, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Props {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    roomId: string
    onImportSuccess: () => void
    onPremiumRequired?: () => void
}

export function PlaylistImportModal({ isOpen, onOpenChange, roomId, onImportSuccess, onPremiumRequired }: Props) {
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const handleImport = async () => {
        if (!url.trim()) return

        setIsLoading(true)
        setError('')
        setSuccessMsg('')

        try {
            const res = await fetch(`/api/rooms/${roomId}/playlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistUrl: url })
            })

            const data = await res.json()

            if (!res.ok) {
                // Check if premium is required
                if (data.isPremiumRequired) {
                    onOpenChange(false)
                    onPremiumRequired?.()
                    return
                }
                throw new Error(data.error || 'Failed to import playlist')
            }

            setSuccessMsg(data.message || 'Playlist imported successfully!')
            setUrl('')
            setTimeout(() => {
                onImportSuccess()
                onOpenChange(false)
                setSuccessMsg('') // Reset for next time
            }, 1000)

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                            <ListMusic className="w-5 h-5" />
                        </div>
                        Import YouTube Playlist
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-400">
                        Paste a YouTube playlist URL to bulk-add songs (max 50) to the queue.
                    </p>

                    <div className="space-y-2">
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="https://www.youtube.com/playlist?list=..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-gray-600"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMsg && (
                            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20 animate-in fade-in slide-in-from-top-1">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>{successMsg}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="bg-transparent hover:bg-white/5 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={isLoading || !url}
                            className={`
                                min-w-[100px] bg-red-600 hover:bg-red-500 
                                ${successMsg ? 'bg-green-600 hover:bg-green-500' : ''}
                            `}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : successMsg ? (
                                'Done'
                            ) : (
                                'Import'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
