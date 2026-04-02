// app/room/[id]/page.tsx
'use client'

import * as Sentry from '@sentry/nextjs'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import SyncAudio, { SyncAudioHandle } from '../../../components/SyncAudio'
import { getSocket, connectSocket, disconnectSocket } from '../../../lib/socket'
import QueueList from './QueueList'

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, VisuallyHidden } from '../../../components/ui/dialog';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Search, Users, Music, X, Share2, ListMusic, Crown } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PlaylistImportModal } from '../../../components/PlaylistImportModal';
import { trackRoomJoin, identifyUser } from '../../../components/PostHogProvider';
import { PremiumUpgradeModal } from '../../../components/PremiumUpgradeModal';
import { PremiumWelcomeModal } from '../../../components/PremiumWelcomeModal';
import { ManageBillingButton } from '../../../components/ManageBillingButton';
import { SharePlaylistModal } from '../../../components/SharePlaylistModal';
import { CONFIG } from '../../../lib/config';


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
    const localIndexChangeRef = useRef(0); // Timestamp of last local index change (play next/prev/queue select)
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
    const syncAudioRef = useRef<SyncAudioHandle>(null);
    const [roomDetails, setRoomDetails] = useState<{ name?: string; host?: { id?: string; name?: string; email?: string; image?: string } } | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    // Share link includes ?sync=true to auto-enable sync for invited users
    const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}?sync=true` : '';
    const [copied, setCopied] = useState(false);
    const [members, setMembers] = useState<{ id: string; name?: string; image?: string }[]>([]);
    const [playerMounted, setPlayerMounted] = useState(false);
    const [sharePlaylistOpen, setSharePlaylistOpen] = useState(false);

    // Sync state - WebSocket only connects when sync is enabled (cost optimization)
    const [isSyncEnabled, setIsSyncEnabled] = useState(false);
    const [isSyncConnecting, setIsSyncConnecting] = useState(false);

    // Theme State
    const [theme, setTheme] = useState<'default' | 'love'>('default');
    const [boughtThemes, setBoughtThemes] = useState<string[]>(['default']);

    // Premium State
    const [isPremium, setIsPremium] = useState(false);
    const [isHostPremium, setIsHostPremium] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumTrigger, setPremiumTrigger] = useState<'queue_limit' | 'sync_limit' | 'general'>('general');
    const [error, setError] = useState<string | null>(null);
    const [loadingText, setLoadingText] = useState('Loading room...');

    // Event Mode State
    const [isEventGuest, setIsEventGuest] = useState(false);
    const [isEventMode, setIsEventMode] = useState(false);
    const [eventToken, setEventToken] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const guestAudioRef = useRef<HTMLAudioElement | null>(null);
    // DEBUG: on-screen log for iOS Chrome (no DevTools access)
    const [debugLogs, setDebugLogs] = useState<string[]>([]);
    const addDebugLog = useCallback((msg: string) => {
        setDebugLogs(prev => [...prev.slice(-15), `${new Date().toLocaleTimeString()}: ${msg}`]);
    }, []);
    const [guestId, setGuestId] = useState('');

    useEffect(() => {
        const stored = sessionStorage.getItem('guestId');
        if (stored) {
            setGuestId(stored);
        } else {
            const id = 'guest-' + crypto.randomUUID();
            sessionStorage.setItem('guestId', id);
            setGuestId(id);
        }
    }, []);

    const themeStyles = {
        default: {
            bg: "bg-gradient-to-br from-gray-900 via-gray-950 to-black",
            text: "text-red-200",
            primary: "text-red-500",
            accent: "bg-red-500",
            buttonGradient: "from-red-700 to-red-500 hover:from-red-800 hover:to-red-600",
            iconBg: "bg-gradient-to-br from-red-700 to-red-500",
            border: "border-red-700/30",
            subtleBg: "bg-red-700/10",
            pulse: "bg-gray-800/5",
            musicIcon: "bg-gradient-to-br from-red-700 to-red-500",
            searchLoading: "border-red-300/30 border-t-red-300",
            scrollbarThumb: "bg-red-500/50 hover:bg-red-500/70",
        },
        love: {
            bg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-pink-900 to-black",
            text: "text-pink-100",
            primary: "text-pink-400",
            accent: "bg-pink-500",
            buttonGradient: "from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]",
            iconBg: "bg-gradient-to-br from-pink-500 to-rose-400 shadow-lg shadow-pink-500/20",
            border: "border-pink-500/20",
            subtleBg: "bg-pink-500/5",
            pulse: "bg-pink-400/5",
            musicIcon: "bg-gradient-to-br from-pink-500 to-rose-400",
            searchLoading: "border-pink-200/30 border-t-pink-200",
            scrollbarThumb: "bg-pink-500/50 hover:bg-pink-500/70",
        }
    };

    const currentTheme = themeStyles[theme];

    // Check for event token on mount
    useEffect(() => {
        const token = searchParams.get('event');
        if (token) {
            setEventToken(token);
        }
    }, [searchParams]);

    useEffect(() => {
        if (status === "unauthenticated") {
            // If event token is present, allow guest access
            const token = searchParams.get('event');
            if (token) {
                setIsEventGuest(true);
                setEventToken(token);
                return;
            }
            // Include both pathname and search params to preserve ?sync=true in callback
            const callbackUrl = typeof window !== 'undefined'
                ? window.location.pathname + window.location.search
                : '/dashboard';
            router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
    }, [status, router, searchParams]);

    // Progressive loading text effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingText('Fetching queue...');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Consolidated init: Fetch room details + queue in a single call
    // Reduces 2 HTTP requests + 4 DB queries to 1 HTTP request + 1 DB query
    useEffect(() => {
        // Allow loading for authenticated users OR event guests
        const isAuthenticated = status === "authenticated";
        const isGuest = isEventGuest && eventToken;
        if (!isAuthenticated && !isGuest) return;

        const abortController = new AbortController();
        const initUrl = isGuest
            ? `/api/rooms/${roomId}/init?eventToken=${encodeURIComponent(eventToken!)}`
            : `/api/rooms/${roomId}/init`;

        fetch(initUrl, { signal: abortController.signal })
            .then(r => {
                if (!r.ok) {
                    if (r.status === 404) {
                        if (isGuest) {
                            throw new Error('Event ended');
                        }
                        throw new Error('Room not found');
                    }
                    if (r.status === 401) {
                        if (isGuest) {
                            throw new Error('Invalid event link');
                        }
                        const callbackUrl = typeof window !== 'undefined'
                            ? window.location.pathname + window.location.search
                            : '/dashboard';
                        router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
                        throw new Error('Session expired');
                    }
                    throw new Error(`Failed to load room (${r.status})`);
                }
                return r.json();
            })
            .then((data) => {
                // Set room details
                setRoomDetails({
                    name: data.name,
                    host: data.host
                });

                // Set event mode state
                setIsEventMode(data.isEventMode ?? false);
                setIsHost(data.isHost ?? false);
                if (data.eventToken) setEventToken(data.eventToken);

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

                // Set premium status
                setIsPremium(data.isPremium ?? false);
                setIsHostPremium(data.isHostPremium ?? false);

                // Set bought themes (merged from /api/user/themes)
                setBoughtThemes(data.boughtThemes ?? ['default']);

                // Mount the player after initial data load
                setPlayerMounted(true);

                // Track user and room join for PostHog analytics (active users)
                if (session?.user?.id) {
                    identifyUser(session.user.id, {
                        name: session.user.name,
                        email: session.user.email,
                    });
                    trackRoomJoin(roomId);
                }
            })
            .catch(err => {
                // Ignore aborted fetches (caused by effect cleanup on re-render)
                if (err.name === 'AbortError') return;
                console.error('Failed to load room:', err);
                // Don't report expected errors to Sentry
                if (err.message !== 'Session expired' && err.message !== 'Room not found' && err.message !== 'Invalid event link' && err.message !== 'Event ended') {
                    Sentry.captureException(err, {
                        tags: { component: 'room-init', roomId },
                        extra: { userAgent: navigator.userAgent },
                    });
                }
                if (err.message === 'Room not found' || err.message === 'Invalid event link' || err.message === 'Event ended') {
                    setError(err.message);
                } else if (err.message !== 'Session expired') {
                    setError("Failed to load room data. Please try refreshing.");
                }
            });

        // NOTE: Socket connection is now handled separately based on sync state without queue dependency
        // This prevents unnecessary WebSocket connections for solo listeners
        return () => abortController.abort();
    }, [roomId, status, session, isEventGuest, eventToken]);

    // Restore saved theme from local storage when boughtThemes are available
    useEffect(() => {
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme === 'love' && boughtThemes.includes('love')) {
            setTheme('love');
        } else if (savedTheme === 'default') {
            setTheme('default');
        }
    }, [boughtThemes]);

    // Auto-enable sync if URL has ?sync=true (for shared links) or if event mode
    useEffect(() => {
        if (status !== "authenticated" && !isEventGuest) return;
        const syncParam = searchParams.get('sync');
        if ((syncParam === 'true' || isEventMode) && !isSyncEnabled) {
            console.log('[Sync] Auto-enabling sync from URL parameter or event mode');
            setIsSyncEnabled(true);
        }
    }, [searchParams, status, isSyncEnabled, isEventGuest, isEventMode]);

    // Handle WebSocket connection when sync is enabled
    const handleEnableSync = useCallback(() => {
        if (isSyncEnabled || isSyncConnecting) return; // Already enabled or connecting

        // Free users cannot use sync (unless in event mode)
        if (!isPremium && !isEventMode) {
            setPremiumTrigger('sync_limit');
            setShowPremiumModal(true);
            return;
        }

        console.log('[Sync] Enabling room sync...');
        setIsSyncConnecting(true); // Show loading spinner
        const socket = connectSocket();
        socket.emit('join-room', roomId);

        // Emit presence join (use guestId for event guests)
        const userId = session?.user?.id || guestId;
        const userName = session?.user?.name || 'Guest';
        const userImage = session?.user?.image;
        if (userId) {
            socket.emit('presence-join', {
                roomId,
                user: {
                    id: userId,
                    name: userName,
                    image: userImage,
                }
            });
        }

        setIsSyncEnabled(true);
        console.log('[Sync] Room sync enabled!');
    }, [roomId, session, isSyncEnabled, isSyncConnecting, isPremium, isEventMode, guestId]);

    // Refs for values needed inside the consolidated socket effect (avoids stale closures
    // and prevents the effect from re-running when these change)
    const sessionRef = useRef(session);
    useEffect(() => { sessionRef.current = session; }, [session]);
    const isSyncConnectingRef = useRef(isSyncConnecting);
    useEffect(() => { isSyncConnectingRef.current = isSyncConnecting; }, [isSyncConnecting]);

    // Refs for event guest state (avoids stale closures in socket effect)
    const isEventGuestRef = useRef(isEventGuest);
    useEffect(() => { isEventGuestRef.current = isEventGuest; }, [isEventGuest]);
    const guestIdRef = useRef(guestId);
    useEffect(() => { guestIdRef.current = guestId; }, [guestId]);
    const eventTokenRef = useRef(eventToken);
    useEffect(() => { eventTokenRef.current = eventToken; }, [eventToken]);
    const reconnectSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isEventModeRef = useRef(isEventMode);
    useEffect(() => { isEventModeRef.current = isEventMode; }, [isEventMode]);
    const isHostRef = useRef(isHost);
    useEffect(() => { isHostRef.current = isHost; }, [isHost]);

    // Consolidated socket effect: connect + ALL listeners in one place.
    // This guarantees listeners are always on the correct socket instance.
    useEffect(() => {
        if (!isSyncEnabled) return;
        // Allow for authenticated users or event guests
        if (status !== "authenticated" && !isEventGuest) return;

        console.log('[Sync] Setting up socket connection and all listeners...');
        const socket = connectSocket();
        socket.emit('join-room', roomId);

        // Emit presence join using ref to avoid session dependency
        const sess = sessionRef.current;
        const userId = sess?.user?.id || guestIdRef.current;
        const userName = sess?.user?.name || 'Guest';
        const userImage = sess?.user?.image;
        if (userId) {
            socket.emit('presence-join', {
                roomId,
                user: {
                    id: userId,
                    name: userName,
                    image: userImage,
                }
            });
        }

        // --- Helper: re-join room and refresh state ---
        const rejoinRoom = () => {
            console.log('[Sync] Re-joining room and refreshing queue...');
            socket.emit('join-room', roomId);
            const sess = sessionRef.current;
            const userId = sess?.user?.id || guestIdRef.current;
            const userName = sess?.user?.name || 'Guest';
            const userImage = sess?.user?.image;
            if (userId) {
                socket.emit('presence-join', {
                    roomId,
                    user: {
                        id: userId,
                        name: userName,
                        image: userImage,
                    }
                });
            }
            // Refresh queue so onVideoChanged can find the correct videoId
            refreshQueueRef.current();

            // Request playback sync for event-mode guests after reconnection
            if (isEventModeRef.current && !isHostRef.current) {
                if (reconnectSyncTimerRef.current) clearTimeout(reconnectSyncTimerRef.current);
                reconnectSyncTimerRef.current = setTimeout(() => {
                    if (socket.connected) {
                        console.log('[Sync] Requesting sync-state after reconnection');
                        socket.emit('sync-request', { roomId });
                    }
                }, 3000);
            }
        };

        // --- Reconnect handler: re-join room after Socket.IO auto-reconnect ---
        let hasConnectedOnce = socket.connected; // skip first fire if already connected
        const onReconnect = () => {
            if (!hasConnectedOnce) {
                hasConnectedOnce = true;
                return; // initial connection — already joined above
            }
            console.log('[Sync] Socket reconnected with new ID');
            rejoinRoom();
        };
        socket.on('connect', onReconnect);

        // --- Tab visibility handler: catch cases where socket silently loses server-side room membership ---
        // When a tab is hidden, the server may time out the socket and clean up room membership.
        // The client socket might still appear "connected" but the server no longer has it in the room.
        // Re-joining on visibility change is cheap (server-side join is idempotent) and ensures reliability.
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('[Sync] Tab became visible, ensuring socket is in room...');
                if (socket.connected) {
                    // Socket thinks it's connected — re-join room anyway (idempotent on server)
                    rejoinRoom();
                } else {
                    // Socket is disconnected — force reconnect
                    console.log('[Sync] Socket disconnected while tab was hidden, reconnecting...');
                    socket.connect();
                    // onReconnect will handle re-joining after connect event fires
                }
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        // --- Presence listener ---
        const onPresence = (list: { id: string; name?: string; image?: string }[]) => {
            setMembers(list);
            const currentSession = sessionRef.current;
            if (isSyncConnectingRef.current && currentSession?.user?.id) {
                const userInPresence = list.some(m => m.id === currentSession.user?.id);
                if (userInPresence) {
                    setIsSyncConnecting(false);
                    console.log('[Sync] Connection confirmed - presence received');
                }
            }
        };
        socket.on('room-presence', onPresence);

        // --- Video changed listener ---
        const onVideoChanged = async (newVideoId: string) => {
            try {
                const currentQueue = queueRef.current;
                let idx = currentQueue.findIndex(item => item.videoId === newVideoId);
                console.log(`[video-changed] Received newVideoId: ${newVideoId}, found at index: ${idx}`);
                if (idx === -1) {
                    // Queue might not be synced yet — refresh and retry once
                    console.log(`[video-changed] VideoId not in local queue, refreshing...`);
                    const refreshedData = await refreshQueueRef.current();
                    if (refreshedData) {
                        idx = refreshedData.queue.findIndex((item: { videoId: string }) => item.videoId === newVideoId);
                    }
                }
                if (idx !== -1) {
                    setCurrentQueueIndex(idx);
                } else {
                    console.warn(`[video-changed] VideoId ${newVideoId} not found even after refresh`);
                }
            } catch (err) {
                console.error('[video-changed] Error handling video change:', err);
            }
        };
        socket.on('video-changed', onVideoChanged);

        // --- Queue updated listener ---
        const onQueueUpdated = async () => {
            console.log('[Socket] received queue-updated; refreshing queue');
            await refreshQueueRef.current();
        };
        socket.on('queue-updated', onQueueUpdated);

        // --- Queue removed listener ---
        const onQueueRemoved = async (data: { roomId: string; itemId: string; deletedOrder?: number; newCurrentIndex?: number }) => {
            console.log('[Socket] received queue-removed; refreshing queue', data);
            const oldCurrentIndex = currentQueueIndexRef.current;
            const refreshedData = await refreshQueueRef.current();
            if (!refreshedData) return;

            if (data.newCurrentIndex !== undefined && data.newCurrentIndex !== oldCurrentIndex) {
                const updatedQueue = refreshedData.queue;
                if (updatedQueue.length > 0 && updatedQueue[data.newCurrentIndex]) {
                    const newVideoId = updatedQueue[data.newCurrentIndex].videoId;
                    console.log(`[Socket] Emitting change-video for new current song: ${newVideoId}`);
                    socket.emit('change-video', { roomId, newVideoId });
                }
            }
        };
        socket.on('queue-removed', onQueueRemoved);

        // --- Theme changed listener ---
        const onThemeChanged = (newTheme: 'default' | 'love') => {
            console.log('[Socket] received theme-changed:', newTheme);
            setTheme(newTheme);
            localStorage.setItem('selectedTheme', newTheme);
        };
        socket.on('theme-changed', onThemeChanged);

        // --- Cleanup: remove ALL listeners and disconnect ---
        return () => {
            console.log('[Sync] Cleaning up socket listeners...');
            if (reconnectSyncTimerRef.current) clearTimeout(reconnectSyncTimerRef.current);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            socket.off('connect', onReconnect);
            socket.off('room-presence', onPresence);
            socket.off('video-changed', onVideoChanged);
            socket.off('queue-updated', onQueueUpdated);
            socket.off('queue-removed', onQueueRemoved);
            socket.off('theme-changed', onThemeChanged);
            const sess = sessionRef.current;
            const leaveUserId = sess?.user?.id || guestIdRef.current;
            if (leaveUserId) {
                socket.emit('leave-room', { roomId, userId: leaveUserId });
            }
            disconnectSocket();
        };
    }, [isSyncEnabled, roomId, status, isEventGuest]);


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
        const queueUrl = eventTokenRef.current && isEventGuestRef.current
            ? `/api/rooms/${roomId}/queue?eventToken=${encodeURIComponent(eventTokenRef.current)}`
            : `/api/rooms/${roomId}/queue`;
        const res = await fetch(queueUrl);
        if (!res.ok) return null;
        const data = await res.json();
        setQueue(data.queue);
        // Skip overwriting currentQueueIndex if a local action (play next/prev/queue select)
        // happened recently — the server may not have processed the PATCH yet
        const isLocalActionRecent = Date.now() - localIndexChangeRef.current < 5000;
        if (!isLocalActionRecent) {
            setCurrentQueueIndex(data.currentQueueIndex);
            if (data.queue.length > 0 && data.queue[data.currentQueueIndex]) {
                setVideoId(data.queue[data.currentQueueIndex].videoId);
                setCurrentSong(data.queue[data.currentQueueIndex]);
            } else {
                setVideoId('');
                setCurrentSong(null);
            }
        }
        return data;
    }, [roomId]);

    // Keep a stable ref to refreshQueue so socket listeners never need it as a dependency
    const refreshQueueRef = useRef(refreshQueue);
    useEffect(() => { refreshQueueRef.current = refreshQueue; }, [refreshQueue]);

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

            // Check for queue limit error (403 with isPremiumRequired)
            if (res.status === 403) {
                const errorData = await res.json();
                if (errorData.isPremiumRequired) {
                    setPremiumTrigger('queue_limit');
                    setShowPremiumModal(true);
                    return;
                }
            }

            if (!res.ok) throw new Error('Add failed');
            // Use the POST response directly instead of re-fetching
            const newItem = await res.json();
            setQueue(prev => [...prev, newItem]);
            // If this is the first song, auto-select it
            if (queueRef.current.length === 0) {
                setCurrentQueueIndex(0);
                setVideoId(newItem.videoId);
                setCurrentSong(newItem);
            }

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
        }
    };

    // Sync-driven track change (reconnection scenario — guest switches to host's track)
    const handleSyncTrackChange = useCallback((index: number) => {
        const currentQueue = queueRef.current;
        if (index >= 0 && index < currentQueue.length) {
            console.log(`[Sync] Track change from sync-state: switching to index ${index}`);
            localIndexChangeRef.current = Date.now(); // Prevent refreshQueue from overwriting
            setCurrentQueueIndex(index);
        }
    }, []);

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

            localIndexChangeRef.current = Date.now();
            setCurrentQueueIndex(newIndex);

            // Emit socket event immediately for real-time sync (before PATCH)
            if (isSyncEnabled) {
                const newVideoId = currentQueue[newIndex].videoId;
                const socket = getSocket();
                if (socket) {
                    socket.emit('change-video', { roomId, newVideoId });
                }
            }

            // Persist to backend (non-blocking)
            fetch(`/api/rooms/${roomId}/queue`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentIndex: newIndex })
            }).catch(err => console.error('[Queue] Failed to persist currentIndex:', err));
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

            localIndexChangeRef.current = Date.now();
            setCurrentQueueIndex(newIndex);

            // Emit socket event immediately for real-time sync (before PATCH)
            if (isSyncEnabled) {
                const newVideoId = currentQueue[newIndex].videoId;
                const socket = getSocket();
                if (socket) {
                    socket.emit('change-video', { roomId, newVideoId });
                }
            }

            // Persist to backend (non-blocking)
            fetch(`/api/rooms/${roomId}/queue`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentIndex: newIndex })
            }).catch(err => console.error('[Queue] Failed to persist currentIndex:', err));
        } else {
            console.log('[handlePlayPrev] Already at first song');
        }
    };


    // After remove, update local state directly from DELETE response (no re-fetch needed)
    const handleRemoveFromQueue = (itemId: string, result: { deletedOrder: number; newCurrentIndex: number }) => {
        const updatedQueue = queueRef.current.filter(item => item.id !== itemId);
        setQueue(updatedQueue);
        setCurrentQueueIndex(result.newCurrentIndex);
        // Update current song based on new index
        if (updatedQueue.length > 0 && updatedQueue[result.newCurrentIndex]) {
            setVideoId(updatedQueue[result.newCurrentIndex].videoId);
            setCurrentSong(updatedQueue[result.newCurrentIndex]);
        } else if (updatedQueue.length === 0) {
            setVideoId('');
            setCurrentSong(null);
        }
        setRemovingQueueItemId(null);
    };

    if (status === "loading" || (status === "unauthenticated" && !isEventGuest) || (!roomDetails && !error)) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center animate-pulse">
                        <Music className="w-6 h-6 text-red-500/50" />
                    </div>
                    <div className="text-zinc-500 text-sm">{loadingText}</div>
                </div>
            </div>
        );
    }

    if (error) {
        const isRoomDeleted = error === 'Room not found';
        const isEventEnded = error === 'Event ended';
        const showHomeLink = isRoomDeleted || isEventEnded;
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center text-red-500">
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-red-500/20 backdrop-blur-sm max-w-sm">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        {isEventEnded ? (
                            <Music className="w-6 h-6" />
                        ) : isRoomDeleted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        )}
                    </div>
                    <p className="text-lg font-bold text-red-400 mb-2">
                        {isEventEnded ? 'Event Ended' : isRoomDeleted ? 'Room Deleted' : 'Error'}
                    </p>
                    <p className="text-sm text-red-200/70 mb-6">
                        {isEventEnded
                            ? 'This event has been ended by the host. Thanks for listening!'
                            : isRoomDeleted
                            ? 'This room has been deleted by the host.'
                            : error}
                    </p>
                    {showHomeLink ? (
                        <Link
                            href="/"
                            className="inline-block px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            Go to Homepage
                        </Link>
                    ) : (
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const handleThemeChange = (newTheme: 'default' | 'love') => {
        const updateTheme = () => {
            setTheme(newTheme);
            localStorage.setItem('selectedTheme', newTheme);

            // If host, broadcast theme change
            if (isHost && isSyncEnabled) {
                const socket = getSocket();
                if (socket) {
                    console.log('[Socket] Broadcasting theme change:', newTheme);
                    socket.emit('theme-changed', { roomId, theme: newTheme });
                }
            }
        };

        if (newTheme === 'default') {
            updateTheme();
            return;
        }

        // Premium users always have access to love theme
        if (isPremium || boughtThemes.includes(newTheme)) {
            updateTheme();
        } else {
            setPremiumTrigger('general');
            setShowPremiumModal(true);
        }
    };

    const handlePlaylistImported = async () => {
        await refreshQueue();
        if (isSyncEnabled) {
            const socket = getSocket();
            if (socket) {
                // We emit queue-updated with a dummy item to trigger refresh on other clients
                // or ideally a new event type, but queue-updated works if we just want a refresh
                // Actually, let's just use queue-updated with a special flag if needed, 
                // OR relies on the fact that other clients might not auto-refresh unless they receive an event.
                // Since our queue-updated handler just calls refreshQueue(), sending it (even with null item) works!
                // Let's send a dummy event or better yet, just a generic signal.
                // Looking at QueueList socket listener... it listens for 'queue-updated'.
                socket.emit('queue-updated', { roomId, item: { videoId: 'bulk-import', title: 'Bulk Import', thumbnail: '' } });
            }
        }
    };

    return (
        <div className={`min-h-screen w-full relative overflow-y-auto transition-colors duration-1000 [&::-webkit-scrollbar]:hidden ${currentTheme.bg}`} style={{ scrollbarWidth: 'none' }}>
            {/* Silent audio for iOS audio unlock */}
            <audio
                ref={guestAudioRef}
                src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////"
                loop
                playsInline
                className="hidden"
            />

            {/* Tap-to-join overlay — renders ON TOP while YouTube player mounts behind it.
                This ensures playVideo() is called in a direct user gesture context,
                bypassing iOS Chrome's autoplay restrictions. */}
            {isEventGuest && !audioUnlocked && roomDetails && (
                <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="text-center max-w-md"
                    >
                        {roomDetails.host?.image ? (
                            <img
                                src={roomDetails.host.image}
                                alt={roomDetails.host.name || 'Host'}
                                className="w-20 h-20 rounded-full border-2 border-red-500/30 object-cover mx-auto mb-6"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Music className="w-10 h-10 text-red-400" />
                            </div>
                        )}
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{roomDetails.name || 'Event'}</h1>
                        <p className="text-red-200/70 text-sm sm:text-base mb-8">Hosted by {roomDetails.host?.name || 'the host'}</p>
                        <button
                            onClick={() => {
                                addDebugLog('TAP: button clicked');
                                // Unlock iOS audio context with user gesture
                                if (guestAudioRef.current) {
                                    guestAudioRef.current.play().then(() => addDebugLog('TAP: silent audio played')).catch((e) => addDebugLog(`TAP: silent audio failed: ${e.message}`));
                                }
                                // Also create and play an AudioContext to unlock Web Audio
                                try {
                                    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                                    const osc = ctx.createOscillator();
                                    const gain = ctx.createGain();
                                    gain.gain.value = 0;
                                    osc.connect(gain);
                                    gain.connect(ctx.destination);
                                    osc.start();
                                    osc.stop(ctx.currentTime + 0.1);
                                    addDebugLog(`TAP: AudioContext state=${ctx.state}`);
                                } catch (e) { addDebugLog(`TAP: AudioContext error: ${e}`); }
                                // Play YouTube player in user gesture context
                                syncAudioRef.current?.playVideo();
                                addDebugLog('TAP: playVideo called');
                                setAudioUnlocked(true);
                            }}
                            className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-red-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Tap to Join
                        </button>
                    </motion.div>
                </div>
            )}

            <PlaylistImportModal
                isOpen={importModalOpen}
                onOpenChange={setImportModalOpen}
                roomId={roomId}
                onImportSuccess={handlePlaylistImported}
                onPremiumRequired={() => {
                    setPremiumTrigger('general');
                    setShowPremiumModal(true);
                }}
            />
            <PremiumUpgradeModal
                open={showPremiumModal}
                onOpenChange={setShowPremiumModal}
                trigger={premiumTrigger}
            />
            <PremiumWelcomeModal isPremium={isPremium} />

            {/* Animated background elements */}
            <SharePlaylistModal
                isOpen={sharePlaylistOpen}
                onOpenChange={setSharePlaylistOpen}
                roomId={roomId}
                theme={theme}
            />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {theme === 'default' ? (
                    <>
                        <div className="absolute top-20 left-10 w-72 h-72 bg-red-700/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-800/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
                    </>
                ) : (
                    <>
                        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
                        {/* Floating Hearts */}
                        {/* Love Theme Background Effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {/* Floating Hearts - Varied sizes and movements */}
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={`heart-${i}`}
                                    initial={{
                                        y: "110vh",
                                        x: -50, // Center the element horizontally relative to its left position
                                        opacity: 0,
                                        scale: 0
                                    }}
                                    animate={{
                                        y: "-20vh",
                                        scale: [0, Math.random() * 0.8 + 0.5, 0],
                                        opacity: [0, 0.8, 0],
                                        // Gentle sway
                                        x: [-50, -50 + (Math.random() * 100 - 50), -50],
                                        rotate: [0, Math.random() * 20 - 10, 0]
                                    }}
                                    transition={{
                                        duration: Math.random() * 10 + 15, // 15-25s duration
                                        repeat: Infinity,
                                        delay: Math.random() * 20,
                                        ease: "linear"
                                    }}
                                    className="absolute text-pink-500 blur-none"
                                    style={{
                                        left: `${(i / 20) * 100}%`, // Evenly distributed 0% to 100%
                                        fontSize: Math.random() < 0.3 ? '3rem' : '1.5rem',
                                        filter: 'drop-shadow(0 0 15px rgba(236,72,153,0.6))',
                                        textShadow: '0 0 10px rgba(244,63,94,0.5)'
                                    }}
                                >
                                    {Math.random() > 0.5 ? '❤' : '✨'}
                                </motion.div>
                            ))}

                            {/* Sparkles */}
                            {[...Array(30)].map((_, i) => (
                                <motion.div
                                    key={`sparkle-${i}`}
                                    initial={{
                                        top: Math.random() * 100 + "%",
                                        left: Math.random() * 100 + "%",
                                        scale: 0,
                                        opacity: 0
                                    }}
                                    animate={{
                                        scale: [0, 1, 0],
                                        opacity: [0, 0.8, 0]
                                    }}
                                    transition={{
                                        duration: Math.random() * 2 + 1,
                                        repeat: Infinity,
                                        delay: Math.random() * 5,
                                        repeatDelay: Math.random() * 3
                                    }}
                                    className="absolute w-1 h-1 bg-white rounded-full blur-[0.5px] shadow-[0_0_5px_theme(colors.white)]"
                                />
                            ))}

                            {/* Ambient Glow */}
                            <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-pink-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
                            <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
                        </div>
                    </>
                )}
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`relative sm:fixed ${CONFIG.MAINTENANCE_MODE ? 'sm:top-10' : 'sm:top-0'} sm:left-0 sm:right-0 z-20 w-full px-4 sm:px-6 py-2 sm:backdrop-blur-xl`}
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
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${currentTheme.iconBg} rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500`}>
                                    <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>

                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg  font-bold text-white truncate max-w-[100px] sm:max-w-[200px]">{roomDetails?.name || 'Room'}</h1>
                                    {isHostPremium && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-bold text-black">
                                            <Crown className="w-3 h-3" />
                                            <span className="hidden sm:inline">PRO</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${currentTheme.text}`}>
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate max-w-[80px] sm:max-w-[150px]">Hosted by {roomDetails?.host?.name || 'Unknown'}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    {/* Right: Participants + Invite Button + Profile Avatar */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Event Mode: Host avatar + listener count */}
                        {isEventMode ? (
                            <div className="flex items-center gap-2">
                                {members.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-green-300">
                                        <Users className="w-3.5 h-3.5" />
                                        <span className="font-medium">{members.length}</span>
                                    </div>
                                )}
                                <div className="relative">
                                    {roomDetails?.host?.image ? (
                                        <img src={roomDetails.host.image} alt={roomDetails.host.name || 'Host'} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white/30 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                                            {(roomDetails?.host?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Participants (avatars) — normal mode */}
                                <div className="hidden sm:flex -space-x-2">
                                    {members.slice(0, 5).map((m) => {
                                        const isMemberHost = m.id === roomDetails?.host?.id;
                                        const isCurrentUser = m.id === session?.user?.id;
                                        const showCrown = (isMemberHost && isHostPremium) || (isCurrentUser && isPremium);

                                        return (
                                            <div key={m.id} className="relative">
                                                {m.image ? (
                                                    <img src={m.image} alt={m.name || 'User'} className={`w-8 h-8 rounded-full border-2 ${showCrown ? 'border-yellow-400' : 'border-white/30'} object-cover`} />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full border-2 ${showCrown ? 'border-yellow-400' : 'border-white/30'} bg-white/10 flex items-center justify-center text-white text-xs font-bold`}>
                                                        {(m.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                {showCrown && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                        <Crown className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {members.length > 5 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                                            +{members.length - 5}
                                        </div>
                                    )}
                                </div>

                                {/* Mobile: tiny member avatars (only when sync enabled and members exist) */}
                                {isSyncEnabled && members.length > 0 && (
                                    <div className="flex sm:hidden -space-x-1.5 flex-shrink-0">
                                        {members.slice(0, 3).map((m) => (
                                            <div key={m.id} className="w-5 h-5 rounded-full border border-white/30 overflow-hidden flex-shrink-0 bg-white/10">
                                                {m.image ? (
                                                    <img src={m.image} alt={m.name || 'User'} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-[8px] font-bold">
                                                        {(m.name || '?')[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {members.length > 3 && (
                                            <div className="w-5 h-5 rounded-full border border-white/30 bg-white/10 flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                                                +{members.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Enable Sync Button / Connecting Spinner / Live Indicator */}
                        {!isSyncEnabled && !isSyncConnecting && !isEventMode ? (
                            <Button
                                onClick={handleEnableSync}
                                className="bg-white/10 hover:bg-white/20 text-white font-medium px-2 sm:px-3 py-2 rounded-xl shadow-lg transition-all duration-200 text-sm"
                            >
                                <span>🔗</span>
                                <span className="hidden sm:inline ml-1.5">Enable Sync</span>
                            </Button>
                        ) : isSyncConnecting ? (
                            <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:px-3 sm:py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-xl">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
                                <span className="hidden sm:inline text-yellow-300 text-sm font-medium">Connecting...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:px-3 sm:py-2 bg-green-500/20 border border-green-500/40 rounded-xl">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="hidden sm:inline text-green-300 text-sm font-medium">Live</span>
                            </div>
                        )}

                        {/* Invite Button — hidden for event guests (only host can share) */}
                        {!(isEventMode && !isHost) && (
                            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                        onClick={(e) => {
                                            // In event mode, skip premium check
                                            if (!isEventMode && !isPremium) {
                                                e.preventDefault();
                                                setPremiumTrigger('sync_limit');
                                                setShowPremiumModal(true);
                                                return;
                                            }
                                            // Auto-enable sync when sharing
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
                                    <VisuallyHidden>
                                        <DialogTitle>{isEventMode ? 'Share Event Link' : 'Invite to Room with real-time sync'}</DialogTitle>
                                    </VisuallyHidden>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Share2 className="w-6 h-6 text-red-400" />
                                        <h2 className="text-lg font-bold">{isEventMode ? 'Share Event Link' : 'Invite to Room with real-time sync'}</h2>
                                    </div>
                                    <div className="flex items-center gap-3 mt-6">
                                        <input
                                            type="text"
                                            value={isEventMode && eventToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/room/${roomId}?event=${eventToken}` : shareLink}
                                            readOnly
                                            className="flex-1 h-12 bg-white/10 border-white/20 text-white text-sm px-4 rounded-xl backdrop-blur-sm"
                                        />
                                        <Button
                                            onClick={async () => {
                                                const linkToCopy = isEventMode && eventToken
                                                    ? `${window.location.origin}/room/${roomId}?event=${eventToken}`
                                                    : shareLink;
                                                await navigator.clipboard.writeText(linkToCopy);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className={`h-12 px-4 bg-gradient-to-r ${currentTheme.buttonGradient} text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105`}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </Button>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {isEventMode ? 'Guests can join without signing in.' : 'Share this link to invite others to your music room.'}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                        {/* Profile Avatar + Dropdown — hidden for event guests */}
                        {session?.user && (
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
                                                <div className={`text-xs ${currentTheme.text}`}>{session?.user?.email || ''}</div>
                                            </div>
                                        </div>
                                        <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
                                        <DropdownMenu.Item
                                            className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer outline-none ${theme === 'default' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                            onSelect={() => handleThemeChange('default')}
                                        >
                                            <span>🎨</span>
                                            Default Theme
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer outline-none ${theme === 'love' ? 'bg-pink-500/20 text-pink-400' : 'text-gray-400 hover:text-pink-300 hover:bg-pink-500/10'}`}
                                            onSelect={() => handleThemeChange('love')}
                                        >
                                            <span>❤</span>
                                            Love Theme
                                            {!boughtThemes.includes('love') && <span className="text-[10px] bg-pink-500/20 px-1 rounded border border-pink-500/30">PRO</span>}
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            onSelect={() => { window.location.href = '/dashboard'; }}
                                            className="w-full px-4 py-2 rounded-lg text-left hover:bg-red-700/30 transition-colors cursor-pointer font-medium"
                                        >
                                            My Dashboard
                                        </DropdownMenu.Item>

                                        <ManageBillingButton isPremium={isPremium} />
                                        <DropdownMenu.Item
                                            onSelect={() => signOut({ callbackUrl: '/' })}
                                            className="w-full px-4 py-2 rounded-lg text-left hover:bg-white/20 transition-colors cursor-pointer font-medium"
                                        >
                                            Logout
                                        </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        )}
                    </div>
                </div>
            </motion.header>



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
                            // We can dynamically set the gradient, but hardcoded gradient is fine for now, maybe just keep it dark
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
                                {!(isEventMode && !isHost) && (
                                    <Button
                                        onClick={() => {
                                            setModalOpen(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full bg-gradient-to-r ${currentTheme.buttonGradient} text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl`}
                                    >
                                        <Search className="w-5 h-5 mr-2" />
                                        Search Music
                                    </Button>
                                )}

                                <div className={`text-sm ${currentTheme.text} pt-4 border-t border-white/10`}>
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
            <main className={`relative z-10 px-2 sm:px-4 pb-6 ${CONFIG.MAINTENANCE_MODE ? 'sm:pt-24' : 'sm:pt-14'}`}>
                <div className="max-w-7xl mx-auto">
                    {/* Search Card — hidden for non-host event users */}
                    {!(isEventMode && !isHost) && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                                <DialogTrigger asChild>
                                    <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white/10 backdrop-blur-md border-white/20 overflow-hidden group">
                                        <CardContent className="p-3 sm:p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className={`w-12 h-12 ${currentTheme.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-500`}>
                                                        <Search className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className={`absolute -top-1 -right-1 w-5 h-5 ${currentTheme.accent} rounded-full flex items-center justify-center`}>
                                                        <span className="text-white text-xs font-bold">+</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-base font-bold text-white mb-0.5">Search & Add Music</h3>
                                                    <p className={`text-sm ${currentTheme.text} opacity-90`}>Discover new tracks and add them to the queue</p>
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
                                    <VisuallyHidden>
                                        <DialogTitle>Search Music Library</DialogTitle>
                                    </VisuallyHidden>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-10 h-10 ${currentTheme.iconBg} rounded-xl flex items-center justify-center transition-colors duration-500`}>
                                                <Search className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg sm:text-xl font-bold">Search Music Library</h2>
                                                <p className={`text-xs sm:text-sm ${currentTheme.text}`}>Find and add songs to your queue</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className={`w-full rounded-xl px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 ${theme === 'love' ? 'focus:ring-pink-500' : 'focus:ring-red-500'} focus:border-transparent transition-all text-sm sm:text-base`}
                                                    placeholder="Search for songs, artists, or albums..."
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                    autoFocus
                                                />
                                                <Search className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'love' ? 'text-pink-300' : 'text-red-300'}`} />
                                                {searchLoading && (
                                                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                                                        <div className={`w-5 h-5 border-2 rounded-full animate-spin ${currentTheme.searchLoading}`}></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {searchError && (
                                            <div className={`p-2 sm:p-3 ${currentTheme.subtleBg} border ${currentTheme.border} rounded-lg ${currentTheme.text} text-xs sm:text-sm`}>
                                                {searchError}
                                            </div>
                                        )}

                                        <div className="max-h-60 sm:max-h-96 overflow-y-auto custom-scrollbar">
                                            {searchResults.length === 0 && !searchLoading && !search.trim() && (
                                                <div className="text-center py-8 sm:py-12">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Music className={`w-6 h-6 sm:w-8 sm:h-8 ${theme === 'love' ? 'text-pink-300' : 'text-red-300'}`} />
                                                    </div>
                                                    <p className={`${currentTheme.text} font-medium text-sm sm:text-base`}>Start typing to search</p>
                                                    <p className={`text-xs sm:text-sm ${currentTheme.text} mt-1`}>Search for songs, artists, or albums</p>
                                                </div>
                                            )}
                                            {searchResults.length === 0 && !searchLoading && search.trim() && (
                                                <div className="text-center py-8 sm:py-12">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Search className={`w-6 h-6 sm:w-8 sm:h-8 ${theme === 'love' ? 'text-pink-300' : 'text-red-300'}`} />
                                                    </div>
                                                    <p className={`${currentTheme.text} font-medium text-sm sm:text-base`}>No results found</p>
                                                    <p className={`text-xs sm:text-sm ${currentTheme.text} mt-1`}>Try a different search term</p>
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
                                                            <p className={`text-xs sm:text-sm ${currentTheme.text} opacity-80`}>Click to add to queue</p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <Button
                                                                onClick={() => handleAddToQueue(item)}
                                                                className={`cursor-pointer bg-gradient-to-r ${currentTheme.buttonGradient} text-white font-medium px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap`}
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

                            {/* Import Playlist Card */}
                            <Card
                                onClick={() => setImportModalOpen(true)}
                                className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white/10 backdrop-blur-md border-white/20 overflow-hidden group"
                            >
                                <CardContent className="p-3 sm:p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md border-white/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                                                <ListMusic className="w-6 h-6 text-white" />
                                            </div>

                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-bold text-white mb-0.5">Import Playlist</h3>
                                            <p className={`text-sm ${currentTheme.text} opacity-90`}>Bulk add songs from YouTube</p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                <ChevronDownIcon className="w-5 h-5 text-white -rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}



                    {/* Event guest welcome banner */}
                    {isEventMode && !isHost && (
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="mt-4 mb-4 text-center"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">Thanks for joining this event</h2>
                            <p className={`text-sm sm:text-base ${currentTheme.text} mt-1`}>Hosted by {roomDetails?.host?.name || 'the host'} - Sit back and enjoy the music</p>
                        </motion.div>
                    )}

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
                                    <div className="pt-6">
                                        {/* Mount once after initial data load; keep mounted thereafter */}
                                        {playerMounted && (
                                            <SyncAudio
                                                ref={syncAudioRef}
                                                roomId={roomId}
                                                videoId={videoId}
                                                isHost={isHost}
                                                isEventMode={isEventMode}
                                                onPlayNext={handlePlayNext}
                                                onPlayPrev={handlePlayPrev}
                                                songTitle={currentSong?.title}
                                                thumbnailUrl={currentSong?.thumbnail}
                                                theme={theme}
                                                currentQueueIndex={currentQueueIndex}
                                                onSyncTrackChange={handleSyncTrackChange}
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
                                                <p className={currentTheme.text}>Add some music to get started</p>
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
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl h-[350px] sm:h-[450px] xl:h-[520px] flex flex-col">
                                {/* Queue Header */}
                                <div className="p-3 sm:p-6 pb-2 sm:pb-2 border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 ${currentTheme.iconBg} rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500`}>
                                                <Music className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-bold text-white">Up Next</h3>
                                                <p className={`text-xs sm:text-sm ${currentTheme.text}`}>{queue.length} {queue.length === 1 ? 'song' : 'songs'} in queue</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-gray-400 text-sm">Share playlist</div>
                                            <button
                                                onClick={() => setSharePlaylistOpen(true)}
                                                className="p-2 rounded-lg text-white  transition-colors"
                                                title="Share Playlist"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setIsQueueCollapsed(!isQueueCollapsed)}
                                                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors xl:hidden"
                                            >
                                                {isQueueCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Queue Content */}
                                <div className={`flex-1 overflow-y-auto custom-scrollbar ${isQueueCollapsed ? 'hidden xl:block' : 'block'}`}>
                                    <div className="p-3 sm:p-6 pt-2 sm:pt-4">
                                        <QueueList
                                            roomId={roomId}
                                            queue={queue}
                                            theme={theme}
                                            onSelect={async (id) => {
                                                const idx = queue.findIndex(item => item.id === id);
                                                if (idx !== -1) {
                                                    localIndexChangeRef.current = Date.now();
                                                    setCurrentQueueIndex(idx);
                                                    // Trigger playVideo synchronously within the click event
                                                    // so iOS recognizes it as a user gesture
                                                    syncAudioRef.current?.playVideo();
                                                    // Emit socket event immediately for real-time sync (before PATCH)
                                                    if (isSyncEnabled) {
                                                        const newVideoId = queue[idx].videoId;
                                                        const socket = getSocket();
                                                        if (socket) {
                                                            socket.emit('change-video', { roomId, newVideoId });
                                                        }
                                                    }
                                                    // Persist to backend (non-blocking)
                                                    fetch(`/api/rooms/${roomId}/queue`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ currentIndex: idx })
                                                    }).catch(err => console.error('[Queue] Failed to persist currentIndex:', err));
                                                }
                                            }}
                                            currentVideoId={videoId}
                                            onRemove={handleRemoveFromQueue}
                                            removingQueueItemId={removingQueueItemId}
                                            setRemovingQueueItemId={setRemovingQueueItemId}
                                            readOnly={isEventMode && !isHost}
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
          background: ${theme === 'love' ? 'rgba(236, 72, 153, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'love' ? 'rgba(236, 72, 153, 0.7)' : 'rgba(239, 68, 68, 0.7)'};
        }
      `}</style>

            {/* DEBUG: On-screen log overlay for iOS Chrome testing — REMOVE AFTER DEBUGGING */}
            {debugLogs.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-black/90 text-green-400 text-[10px] font-mono p-2 max-h-40 overflow-y-auto">
                    {debugLogs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
            )}
        </div>
    );
}