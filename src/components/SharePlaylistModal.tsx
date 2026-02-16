import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Share2, Copy } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SharePlaylistModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    roomId: string;
    theme?: 'default' | 'love';
}

export function SharePlaylistModal({ isOpen, onOpenChange, roomId, theme = 'default' }: SharePlaylistModalProps) {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Generate link WITHOUT ?sync=true
    const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const themeStyles = {
        default: {
            iconColor: "text-red-400",
            buttonGradient: "from-red-700 to-red-500 hover:from-red-800 hover:to-red-600",
            titleGradient: "from-red-400 to-red-600"
        },
        love: {
            iconColor: "text-pink-400",
            buttonGradient: "from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500",
            titleGradient: "from-pink-400 to-rose-600"
        }
    };

    const currentTheme = themeStyles[theme];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <Share2 className={`w-6 h-6 ${currentTheme.iconColor}`} />
                        <DialogTitle className={`text-xl font-bold bg-gradient-to-r ${currentTheme.titleGradient} bg-clip-text text-transparent`}>
                            Share Playlist
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400">
                        Share this link to let others listen to this playlist on their own (no sync).
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3 mt-4">
                    <div className="flex-1 relative">
                        <Input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="h-12 bg-white/10 border-white/20 text-white text-sm pr-12 rounded-xl backdrop-blur-sm focus-visible:ring-0 focus-visible:border-white/40"
                        />
                    </div>
                    <Button
                        onClick={handleCopy}
                        className={`h-12 px-4 bg-gradient-to-r ${currentTheme.buttonGradient} text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105`}
                    >
                        {copied ? 'Copied!' : <Copy className="w-4 h-4" />}
                    </Button>
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full h-11 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
