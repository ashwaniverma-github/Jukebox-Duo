// app/room/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import SyncAudio from '../../../components/SyncAudio'
import { getSocket, connectSocket, disconnectSocket, isSocketConnected } from '../../../lib/socket'
import QueueList from './QueueList'
import JoinRoom from './JoinRoom'
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogTrigger, DialogContent } from '../../../components/ui/dialog';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Search, Users, Music, X, Share2 } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DonationModal } from '../../../components/DonationModal';

// New Year 2026 Countdown Component
function NewYearCountdown() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isNewYear, setIsNewYear] = useState(false);

    useEffect(() => {
        const targetDate = new Date('2026-01-01T00:00:00').getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference <= 0) {
                setIsNewYear(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    const TimeBox = ({ value }: { value: number }) => (
        <div className="flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 backdrop-blur-sm border border-purple-400/30 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
        </div>
    );

    if (isNewYear) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 mx-4 sm:mx-6 mb-4"
            >
                <div className="max-w-7xl mx-auto text-center py-4">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Happy New Year 2026!
                    </h2>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative z-10 mx-4 sm:mx-6 mb-4"
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-3">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-white bg-clip-text text-transparent">2026</h2>
                    <div className="text-2xl sm:text-3xl font-bold bg-white bg-clip-text text-transparent">-</div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <TimeBox value={timeLeft.days} />
                        <span className="text-purple-400 text-xl font-light">:</span>
                        <TimeBox value={timeLeft.hours} />
                        <span className="text-purple-400 text-xl font-light">:</span>
                        <TimeBox value={timeLeft.minutes} />
                        <span className="text-purple-400 text-xl font-light">:</span>
                        <TimeBox value={timeLeft.seconds} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function RoomPage() {
    const { id: roomId } = useParams() as { id: string };
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // All hooks must be called unconditionally
    const [videoId, setVideoId] = useState('');
    const [currentSong, setCurrentSong] = useState<{ videoId: string; title: string; thumbnail?: string } | null>(null);
    const [queue, setQueue] = useState<{ id: string; videoId: string; title: string; thumbnail?: string; order: number }[]>([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
    const currentQueueIndexRef = useRef(currentQueueIndex);
    const queueRef = useRef(queue);
    useEffect(() => { currentQueueIndexRef.current = currentQueueIndex; }, [currentQueueIndex]);
    useEffect(() => { queueRef.current = queue; }, [queue]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<{ videoId: string; title: string; thumbnail?: string }[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [isQueueCollapsed, setIsQueueCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [removingQueueItemId, setRemovingQueueItemId] = useState<string | null>(null);
    // Debounce timer for search
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [roomDetails, setRoomDetails] = useState<{ name?: string; host?: { name?: string; email?: string } } | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    // Share link includes ?sync=true to auto-enable sync for invited users
    const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}?sync=true` : '';
    const [copied, setCopied] = useState(false);
    const [members, setMembers] = useState<{ id: string; name?: string; image?: string }[]>([]);
    const [playerMounted, setPlayerMounted] = useState(false);
    const [supportModalOpen, setSupportModalOpen] = useState(false);

    // Sync state - WebSocket only connects when sync is enabled (cost optimization)
    const [isSyncEnabled, setIsSyncEnabled] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            const callbackUrl = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
            router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
    }, [status, router]);

    // Consolidated init: Fetch room details + queue in a single call
    // Reduces 2 HTTP requests + 4 DB queries to 1 HTTP request + 1 DB query
    useEffect(() => {
        if (status !== "authenticated") return;
        fetch(`/api/rooms/${roomId}/init`)
            .then(r => r.json())
            .then((data) => {
                // Set room details
                setRoomDetails({
                    name: data.name,
                    host: data.host
                });

                // Set queue data
                setQueue(data.queue);
                setCurrentQueueIndex(data.currentQueueIndex);
                if (data.queue.length > 0 && data.queue[data.currentQueueIndex]) {
                    setVideoId(data.queue[data.currentQueueIndex].videoId);
                    setCurrentSong(data.queue[data.currentQueueIndex]);
                } else {
                    setVideoId('');
                    setCurrentSong(null);
                }

                // Mount the player after initial data load
                setPlayerMounted(true);
            })
            .catch(err => {
                console.error('Failed to load room:', err);
            });

        // NOTE: Socket connection is now handled separately based on sync state
        // This prevents unnecessary WebSocket connections for solo listeners
    }, [roomId, status]);

    // Auto-enable sync if URL has ?sync=true (for shared links)
    useEffect(() => {
        if (status !== "authenticated") return;
        const syncParam = searchParams.get('sync');
        if (syncParam === 'true' && !isSyncEnabled) {
            console.log('[Sync] Auto-enabling sync from URL parameter');
            setIsSyncEnabled(true);
        }
    }, [searchParams, status, isSyncEnabled]);

    // Handle WebSocket connection when sync is enabled
    const handleEnableSync = useCallback(() => {
        if (isSyncEnabled) return; // Already enabled

        console.log('[Sync] Enabling room sync...');
        const socket = connectSocket();
        socket.emit('join-room', roomId);

        // Emit presence join
        if (session?.user?.id) {
            socket.emit('presence-join', {
                roomId,
                user: {
                    id: session.user.id,
                    name: session.user.name,
                    image: session.user.image,
                }
            });
        }

        setIsSyncEnabled(true);
        console.log('[Sync] Room sync enabled!');
    }, [roomId, session, isSyncEnabled]);

    // Connect WebSocket when sync is enabled (either manually or via URL param)
    useEffect(() => {
        if (!isSyncEnabled || status !== "authenticated") return;

        // Only connect if not already connected
        if (!isSocketConnected()) {
            console.log('[Sync] Connecting WebSocket...');
            const socket = connectSocket();
            socket.emit('join-room', roomId);

            // Emit presence join
            if (session?.user?.id) {
                socket.emit('presence-join', {
                    roomId,
                    user: {
                        id: session.user.id,
                        name: session.user.name,
                        image: session.user.image,
                    }
                });
            }
        }

        // Cleanup on unmount
        return () => {
            const socket = getSocket();
            if (socket && session?.user?.id) {
                socket.emit('leave-room', { roomId, userId: session.user.id });
            }
            disconnectSocket();
        };
    }, [isSyncEnabled, roomId, session, status]);

    // Live presence via socket (only when sync is enabled)
    useEffect(() => {
        if (status !== "authenticated" || !isSyncEnabled) return;

        const socket = getSocket();
        if (!socket) return;

        const onPresence = (list: { id: string; name?: string; image?: string }[]) => {
            setMembers(list);
        };
        socket.on('room-presence', onPresence);
        return () => {
            socket.off('room-presence', onPresence);
        };
    }, [roomId, status, isSyncEnabled]);


    // When queue or currentQueueIndex changes, update currentSong and videoId
    useEffect(() => {
        if (queue.length > 0 && queue[currentQueueIndex]) {
            setCurrentSong(queue[currentQueueIndex]);
            setVideoId(queue[currentQueueIndex].videoId);
        } else {
            setCurrentSong(null);
            setVideoId('');
        }
    }, [queue, currentQueueIndex]);

    // Helper: refetch queue from backend to ensure canonical IDs/order
    const refreshQueue = useCallback(async () => {
        const res = await fetch(`/api/rooms/${roomId}/queue`);
        if (!res.ok) return;
        const data = await res.json();
        setQueue(data.queue);
        setCurrentQueueIndex(data.currentQueueIndex);
        if (data.queue.length > 0 && data.queue[data.currentQueueIndex]) {
            setVideoId(data.queue[data.currentQueueIndex].videoId);
            setCurrentSong(data.queue[data.currentQueueIndex]);
        } else {
            setVideoId('');
            setCurrentSong(null);
        }
    }, [roomId]);

    // Debounced search function
    const debouncedSearch = useCallback(
        (searchTerm: string) => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(async () => {
                if (!searchTerm.trim()) {
                    setSearchResults([]);
                    setSearchLoading(false);
                    setSearchError('');
                    return;
                }
                setSearchLoading(true);
                setSearchError('');
                try {
                    const res = await fetch(`/api/rooms/${roomId}/search?q=${encodeURIComponent(searchTerm)}`);
                    if (!res.ok) throw new Error('Search failed');
                    const data = await res.json();
                    setSearchResults(data);
                } catch (err) {
                    setSearchError('Failed to search. Try again.');
                    console.error('Search failed:', err);
                } finally {
                    setSearchLoading(false);
                }
            }, 300);
        },
        [roomId]
    );

    // Effect to trigger search when search term changes
    useEffect(() => {
        if (status !== "authenticated") return;
        if (search.trim()) {
            setSearchLoading(true);
        }
        debouncedSearch(search);
    }, [search, debouncedSearch, status]);

    // Add to queue handler (server-first; then sync via socket if enabled)
    const handleAddToQueue = async (item: { videoId: string; title: string; thumbnail?: string }) => {
        setModalOpen(false);

        try {
            const res = await fetch(`/api/rooms/${roomId}/queue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoId: item.videoId,
                    title: item.title,
                    thumbnail: item.thumbnail
                })
            });
            if (!res.ok) throw new Error('Add failed');
            // Refresh to get canonical DB IDs/order
            await refreshQueue();

            // Only emit socket events if sync is enabled
            if (isSyncEnabled) {
                const socket = getSocket();
                if (socket) {
                    console.log('[Socket] emitting queue-updated', { roomId, item });
                    socket.emit('queue-updated', {
                        roomId,
                        item: {
                            videoId: item.videoId,
                            title: item.title,
                            thumbnail: item.thumbnail
                        }
                    });
                }
            }
        } catch {
            console.error('Failed to add to queue');
        } finally {
            // no-op
        }
    };

    // Play next song handler
    const handlePlayNext = async () => {
        // Always use the most current queue state
        const currentQueue = queueRef.current;
        const idx = currentQueueIndexRef.current;

        console.log(`[handlePlayNext] Current index: ${idx}, Queue length: ${currentQueue.length}`);
        console.log(`[handlePlayNext] Current queue:`, currentQueue.map(q => q.title));

        if (currentQueue.length === 0) {
            console.log('[handlePlayNext] No songs in queue');
            return;
        }

        if (idx < currentQueue.length - 1) {
            const newIndex = idx + 1;
            console.log(`[handlePlayNext] Moving to next song at index ${newIndex}: ${currentQueue[newIndex].title}`);

            setCurrentQueueIndex(newIndex);

            // Update backend
            await fetch(`/api/rooms/${roomId}/queue`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentIndex: newIndex })
            });

            // Only emit socket events if sync is enabled
            if (isSyncEnabled) {
                const newVideoId = currentQueue[newIndex].videoId;
                const socket = getSocket();
                if (socket) {
                    socket.emit('change-video', { roomId, newVideoId });
                    socket.emit('video-changed', newVideoId);
                }
            }
        } else {
            console.log('[handlePlayNext] Reached end of queue');
        }
    };

    // Play previous song handler
    const handlePlayPrev = async () => {
        // Always use the most current queue state
        const currentQueue = queueRef.current;
        const idx = currentQueueIndexRef.current;

        console.log(`[handlePlayPrev] Current index: ${idx}, Queue length: ${currentQueue.length}`);

        if (currentQueue.length === 0) {
            console.log('[handlePlayPrev] No songs in queue');
            return;
        }

        if (idx > 0) {
            const newIndex = idx - 1;
            console.log(`[handlePlayPrev] Moving to previous song at index ${newIndex}: ${currentQueue[newIndex].title}`);

            setCurrentQueueIndex(newIndex);

            // Update backend
            await fetch(`/api/rooms/${roomId}/queue`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentIndex: newIndex })
            });

            // Only emit socket events if sync is enabled
            if (isSyncEnabled) {
                const newVideoId = currentQueue[newIndex].videoId;
                const socket = getSocket();
                if (socket) {
                    socket.emit('change-video', { roomId, newVideoId });
                    socket.emit('video-changed', newVideoId);
                }
            }
        } else {
            console.log('[handlePlayPrev] Already at first song');
        }
    };


    // Listen for video-changed event from socket (only when sync is enabled)
    useEffect(() => {
        if (!isSyncEnabled) return;

        const socket = getSocket();
        if (!socket) return;

        const handler = (newVideoId: string) => {
            // Use current queue ref to find the video
            const currentQueue = queueRef.current;
            const idx = currentQueue.findIndex(item => item.videoId === newVideoId);
            console.log(`[video-changed] Received newVideoId: ${newVideoId}, found at index: ${idx}`);
            if (idx !== -1) {
                setCurrentQueueIndex(idx);
            } else {
                console.warn(`[video-changed] VideoId ${newVideoId} not found in current queue`);
            }
        };
        socket.on('video-changed', handler);
        return () => {
            socket.off('video-changed', handler);
        };
    }, [roomId, isSyncEnabled]); // Removed queue dependency since we use queueRef

    // Listen for queue-updated event from socket (only when sync is enabled)
    useEffect(() => {
        if (!isSyncEnabled) return;

        const socket = getSocket();
        if (!socket) return;

        console.log('[Socket] Setting up queue-updated listener for room:', roomId);
        const handler = async () => {
            console.log('[Socket] received queue-updated; refreshing queue');
            await refreshQueue();
        };
        socket.on('queue-updated', handler);
        console.log('[Socket] queue-updated listener added');
        return () => {
            console.log('[Socket] Removing queue-updated listener');
            socket.off('queue-updated', handler);
        };
    }, [roomId, refreshQueue, isSyncEnabled]);

    // Listen for queue-removed event from socket (only when sync is enabled)
    useEffect(() => {
        if (!isSyncEnabled) return;

        const socket = getSocket();
        if (!socket) return;

        console.log('[Socket] Setting up queue-removed listener for room:', roomId);
        const handler = async (data: { roomId: string; itemId: string; deletedOrder?: number; newCurrentIndex?: number }) => {
            console.log('[Socket] received queue-removed; refreshing queue', data);

            // Store the old current index for comparison
            const oldCurrentIndex = currentQueueIndexRef.current;

            // Refresh the queue to get the updated state from server
            await refreshQueue();

            // Log queue state after refresh for debugging
            console.log(`[Socket] Queue refreshed after deletion. Old index: ${oldCurrentIndex}, New index: ${data.newCurrentIndex}`);

            // If the currently playing song changed due to deletion, emit video-changed
            if (data.newCurrentIndex !== undefined && data.newCurrentIndex !== oldCurrentIndex) {
                console.log(`[Socket] Current playing song changed due to deletion, will sync video`);
                // The refreshQueue already updated videoId and currentSong based on new index
                // But we should emit video-changed to sync the player across all clients
                const updatedQueue = queueRef.current;
                if (updatedQueue.length > 0 && updatedQueue[data.newCurrentIndex]) {
                    const newVideoId = updatedQueue[data.newCurrentIndex].videoId;
                    console.log(`[Socket] Emitting video-changed for new current song: ${newVideoId}`);
                    socket.emit('video-changed', newVideoId);
                }
            }
        };
        socket.on('queue-removed', handler);
        console.log('[Socket] queue-removed listener added');
        return () => {
            console.log('[Socket] Removing queue-removed listener');
            socket.off('queue-removed', handler);
        };
    }, [roomId, refreshQueue, isSyncEnabled]);

    // After remove, sync by refetching and updating current index if needed
    const handleRemoveFromQueue = async () => {
        await refreshQueue();
        setRemovingQueueItemId(null);

        // The refreshQueue will get the updated currentQueueIndex from the server
        // and update our local state accordingly
    };

    if (status === "loading" || status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black relative overflow-hidden">
            {/* Persist membership and join socket room on mount */}
            <JoinRoom roomId={roomId} />
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-700/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-800/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full px-4 sm:px-6 py-4 sm:py-6"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Left: Room Info (dynamic) */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-shrink">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 sm:gap-3 min-w-0"
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold text-white truncate max-w-[100px] sm:max-w-[200px]">{roomDetails?.name || 'Room'}</h1>
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-red-200">
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate max-w-[80px] sm:max-w-[150px]">Hosted by {roomDetails?.host?.name || 'Unknown'}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    {/* Right: Participants + Invite Button + Profile Avatar */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Participants (avatars) */}
                        <div className="hidden sm:flex -space-x-2">
                            {members.slice(0, 5).map((m) => (
                                m.image ? (
                                    <img key={m.id} src={m.image} alt={m.name || 'User'} className="w-8 h-8 rounded-full border-2 border-white/30 object-cover" />
                                ) : (
                                    <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                                        {(m.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                )
                            ))}
                            {members.length > 5 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                                    +{members.length - 5}
                                </div>
                            )}
                        </div>

                        {/* Enable Sync Button / Live Indicator */}
                        {!isSyncEnabled ? (
                            <Button
                                onClick={handleEnableSync}
                                className="bg-white/10 hover:bg-white/20 text-white font-medium px-2 sm:px-3 py-2 rounded-xl shadow-lg transition-all duration-200 text-sm"
                            >
                                <span>🔗</span>
                                <span className="hidden sm:inline ml-1.5">Enable Sync</span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-green-500/20 border border-green-500/40 rounded-xl">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="hidden sm:inline text-green-300 text-sm font-medium">Live</span>
                            </div>
                        )}

                        <button
                            className='cursor-pointer bg-yellow-300 text-black font-semibold rounded-xl p-2 text-sm'
                            onClick={() => setSupportModalOpen(true)} >
                            <span className="sm:hidden">💛</span>
                            <span className="hidden sm:inline">Support</span>
                        </button>

                        {/* Invite Button */}
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                    onClick={() => {
                                        // Auto-enable sync when sharing - you want to sync with invited users
                                        if (!isSyncEnabled) {
                                            handleEnableSync();
                                        }
                                        setInviteOpen(true);
                                    }}
                                    aria-label="Invite"
                                >
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <Share2 className="w-6 h-6 text-red-400" />
                                    <h2 className="text-lg font-bold">Invite to Room</h2>
                                </div>
                                <div className="flex items-center gap-3 mt-6">
                                    <input
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="flex-1 h-12 bg-white/10 border-white/20 text-white text-sm px-4 rounded-xl backdrop-blur-sm"
                                    />
                                    <Button
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(shareLink);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="h-12 px-4 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Share this link to invite others to your music room.</div>
                            </DialogContent>
                        </Dialog>
                        {/* Profile Avatar + Dropdown */}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                {session?.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'Profile'}
                                        className="ml-4 w-10 h-10 rounded-full border-2 border-white/30 shadow-lg cursor-pointer object-cover hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="ml-4 w-10 h-10 rounded-full border-2 border-white/30 shadow-lg bg-white/10 flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:scale-105 transition-transform">
                                        {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                                    </div>
                                )}
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                    sideOffset={8}
                                    align="end"
                                    className="z-50 min-w-[200px] rounded-xl bg-[#1a0d2e] border border-white/20 shadow-2xl p-2 text-white animate-fade-in"
                                >
                                    <div className="flex flex-col items-center gap-2 px-2 py-3">
                                        {session?.user?.image ? (
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name || 'Profile'}
                                                className="w-12 h-12 rounded-full border-2 border-white/30 object-cover mb-1"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white font-bold text-xl mb-1">
                                                {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <div className="font-semibold text-base">{session?.user?.name || 'User'}</div>
                                            <div className="text-xs text-red-200">{session?.user?.email || ''}</div>
                                        </div>
                                    </div>
                                    <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
                                    <DropdownMenu.Item
                                        onSelect={() => { window.location.href = '/dashboard'; }}
                                        className="w-full px-4 py-2 rounded-lg text-left hover:bg-red-700/30 transition-colors cursor-pointer font-medium"
                                    >
                                        My Dashboard
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onSelect={() => signOut({ callbackUrl: '/' })}
                                        className="w-full px-4 py-2 rounded-lg text-left hover:bg-white/20 transition-colors cursor-pointer font-medium"
                                    >
                                        Logout
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                </div>
            </motion.header>

            {/* New Year 2026 Countdown */}
            <NewYearCountdown />

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-[#1a0d2e] to-[#2d145e] border-l border-white/20 p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-bold text-white">Room Menu</h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5 cursor-pointer" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => {
                                        setModalOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <Search className="w-5 h-5 mr-2" />
                                    Search Music
                                </Button>

                                <div className="text-sm text-red-200 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Room is live</span>
                                    </div>
                                    <div className="text-xs opacity-70">
                                        Share room code: <span className="font-mono bg-white/10 px-2 py-1 rounded">{roomId}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="relative z-10 px-2 sm:px-4 pb-6">
                <div className="max-w-7xl mx-auto">
                    {/* Search Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-4 sm:mb-8"
                    >
                        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                            <DialogTrigger asChild>
                                <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white/10 backdrop-blur-md border-white/20 overflow-hidden group">
                                    <CardContent className="p-3 sm:p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-700 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">+</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Search & Add Music</h3>
                                                <p className="text-sm sm:text-base text-red-200 opacity-90">Discover new tracks and add them to the queue</p>
                                            </div>
                                            <div className="hidden sm:block">
                                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                    <ChevronDownIcon className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                            <DialogContent className="w-full max-w-full sm:max-w-2xl mx-2 sm:mx-4 bg-[#1a0d2e] border-white/20 text-white p-2 sm:p-6 rounded-xl">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
                                            <Search className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg sm:text-xl font-bold">Search Music Library</h2>
                                            <p className="text-xs sm:text-sm text-red-200">Find and add songs to your queue</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-xl px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 bg-white/10 backdrop-blur-sm text-white placeholder-red-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                                                placeholder="Search for songs, artists, or albums..."
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                autoFocus
                                            />
                                            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-300" />
                                            {searchLoading && (
                                                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                                                    <div className="w-5 h-5 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {searchError && (
                                        <div className="p-2 sm:p-3 bg-red-700/20 border border-red-700/30 rounded-lg text-red-200 text-xs sm:text-sm">
                                            {searchError}
                                        </div>
                                    )}

                                    <div className="max-h-60 sm:max-h-96 overflow-y-auto custom-scrollbar">
                                        {searchResults.length === 0 && !searchLoading && !search.trim() && (
                                            <div className="text-center py-8 sm:py-12">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Music className="w-6 h-6 sm:w-8 sm:h-8 text-red-300" />
                                                </div>
                                                <p className="text-red-200 font-medium text-sm sm:text-base">Start typing to search</p>
                                                <p className="text-xs sm:text-sm text-red-300 mt-1">Search for songs, artists, or albums</p>
                                            </div>
                                        )}
                                        {searchResults.length === 0 && !searchLoading && search.trim() && (
                                            <div className="text-center py-8 sm:py-12">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-red-300" />
                                                </div>
                                                <p className="text-red-200 font-medium text-sm sm:text-base">No results found</p>
                                                <p className="text-xs sm:text-sm text-red-300 mt-1">Try a different search term</p>
                                            </div>
                                        )}
                                        <div className="space-y-2 sm:space-y-3">
                                            {searchResults.map((item, idx) => (
                                                <motion.div
                                                    key={item.videoId}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 group cursor-pointer"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.title}
                                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg shadow-lg object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <h4 className="font-semibold text-white text-xs sm:text-base leading-tight line-clamp-2 mb-1">{item.title}</h4>
                                                        <p className="text-xs sm:text-sm text-red-200 opacity-80">Click to add to queue</p>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <Button
                                                            onClick={() => handleAddToQueue(item)}
                                                            className="cursor-pointer bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-medium px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
                                                        >
                                                            <span className="text-lg font-bold">+</span>
                                                            <span>Add</span>
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </motion.div>

                    {/* Player and Queue Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-8">
                        {/* Player Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="xl:col-span-2"
                        >
                            <Card className="relative overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
                                {/* Background Image */}
                                {currentSong?.thumbnail && (
                                    <div className="absolute inset-0">
                                        <img
                                            src={currentSong.thumbnail}
                                            alt="background"
                                            className="w-full h-full object-cover"
                                            style={{ filter: 'blur(20px) brightness(0.3)' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    </div>
                                )}

                                <CardContent className="relative z-10 p-5 sm:p-14">
                                    <div className="aspect-video sm:aspect-[21/9] pt-6 ">
                                        {/* Mount once after initial data load; keep mounted thereafter */}
                                        {playerMounted && (
                                            <SyncAudio
                                                roomId={roomId}
                                                videoId={videoId}
                                                isHost={true}
                                                onPlayNext={handlePlayNext}
                                                onPlayPrev={handlePlayPrev}
                                            />
                                        )}

                                        {/* Now Playing card or Empty state */}
                                        {currentSong ? (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="mt-10 sm:mt-16"
                                            >
                                                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <img
                                                            src={currentSong.thumbnail}
                                                            alt={currentSong.title}
                                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg shadow-lg object-cover"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-white text-sm sm:text-lg truncate">{currentSong.title}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                <span className="text-xs sm:text-sm text-green-300 font-medium">Now Playing</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Music className="w-10 h-10 text-white" />
                                                </div>
                                                <p className="text-white text-xl font-bold mb-2">No song playing</p>
                                                <p className="text-red-200">Add some music to get started</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Queue Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="xl:col-span-1"
                        >
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl h-[350px] sm:h-[450px] xl:h-[600px] flex flex-col">
                                {/* Queue Header */}
                                <div className="p-3 sm:p-6 pb-2 sm:pb-4 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <Music className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-bold text-white">Up Next</h3>
                                                <p className="text-xs sm:text-sm text-red-200">{queue.length} {queue.length === 1 ? 'song' : 'songs'} in queue</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsQueueCollapsed(!isQueueCollapsed)}
                                            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors xl:hidden"
                                        >
                                            {isQueueCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Queue Content */}
                                <div className={`flex-1 overflow-y-auto custom-scrollbar ${isQueueCollapsed ? 'hidden xl:block' : 'block'}`}>
                                    <div className="p-3 sm:p-6 pt-2 sm:pt-4">
                                        <QueueList
                                            roomId={roomId}
                                            queue={queue}
                                            onSelect={async (id) => {
                                                const idx = queue.findIndex(item => item.id === id);
                                                if (idx !== -1) {
                                                    setCurrentQueueIndex(idx);
                                                    // Update backend
                                                    await fetch(`/api/rooms/${roomId}/queue`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ currentIndex: idx })
                                                    });
                                                    // Only emit socket events if sync is enabled
                                                    if (isSyncEnabled) {
                                                        const newVideoId = queue[idx].videoId;
                                                        const socket = getSocket();
                                                        if (socket) {
                                                            socket.emit('change-video', { roomId, newVideoId });
                                                            socket.emit('video-changed', newVideoId);
                                                        }
                                                    }
                                                }
                                            }}
                                            currentVideoId={videoId}
                                            onRemove={handleRemoveFromQueue}
                                            removingQueueItemId={removingQueueItemId}
                                            setRemovingQueueItemId={setRemovingQueueItemId}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Custom scrollbar styles */}
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
      `}</style>

            {/* Donation Modal - shows on first visit */}
            <DonationModal />

            {/* Support Modal - controlled by button click */}
            <DonationModal open={supportModalOpen} onOpenChange={setSupportModalOpen} />
        </div>
    );
}