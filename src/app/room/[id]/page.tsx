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
import { trackRoomJoin, identifyUser, trackEvent } from '../../../components/PostHogProvider';
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
    const localIndexChangeRef = useRef(0); // Timestamp of last index change (local or remote video-changed) — guards refreshQueue from overwriting
    const pendingChangeRef = useRef(false); // True while a song change PATCH is in-flight — blocks refreshQueue from overwriting
    const refreshInFlightRef = useRef(false); // Mutex to prevent concurrent refreshQueue calls
    const pendingEmitVideoRef = useRef<string | null>(null); // Pending change-video emit for when socket reconnects
    const emitOnConnectRegisteredRef = useRef(false); // Whether we already have a once('connect') handler queued
    const sessionRef = useRef(session); // Stable ref — avoids session object in effect deps (re-validates on tab focus)
    useEffect(() => { sessionRef.current = session; }, [session]);
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
    // Tracks last submitted query. Ref is read inside executeSearch to skip duplicate
    // submits; state drives the "pending submit" vs "no results" empty-state copy.
    const lastSearchedRef = useRef<string>('');
    const [submittedQuery, setSubmittedQuery] = useState('');
    const [suggestions, setSuggestions] = useState<{ label: string; source: 'library' | 'cached' }[]>([]);
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
    const [premiumTrigger, setPremiumTrigger] = useState<'queue_limit' | 'sync_limit' | 'search_limit' | 'general'>('general');
    const [error, setError] = useState<string | null>(null);
    const [loadingText, setLoadingText] = useState('Loading room...');

    const [isHost, setIsHost] = useState(false);

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

    useEffect(() => {
        if (status === "unauthenticated") {
            // Include both pathname and search params to preserve ?sync=true in callback
            const callbackUrl = typeof window !== 'undefined'
                ? window.location.pathname + window.location.search
                : '/dashboard';
            router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
    }, [status, router]);

    // Progressive loading text effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingText('Fetching queue...');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Consolidated init: Fetch room details + queue in a single call
    // Reduces 2 HTTP requests + 4 DB queries to 1 HTTP request + 1 DB query
    // IMPORTANT: depends on [roomId, status] only — NOT session.
    // next-auth's useSession() re-validates on tab focus, creating a new session object reference.
    // If session were a dependency, this effect would re-fire on every tab return, fetching stale
    // server state and overwriting the user's current videoId — causing the song revert bug on iOS.
    const initDoneRef = useRef(false);
    useEffect(() => { initDoneRef.current = false; }, [roomId]); // Reset on room change (client-side navigation)
    useEffect(() => {
        if (status !== "authenticated") return;

        // Only run once per room — subsequent state updates come from refreshQueue / socket events
        if (initDoneRef.current) return;

        const abortController = new AbortController();

        fetch(`/api/rooms/${roomId}/init`, { signal: abortController.signal })
            .then(r => {
                if (!r.ok) {
                    if (r.status === 404) {
                        throw new Error('Room not found');
                    }
                    if (r.status === 401) {
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
                initDoneRef.current = true;

                // Set room details
                setRoomDetails({
                    name: data.name,
                    host: data.host
                });

                setIsHost(data.isHost ?? false);

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
                const sess = sessionRef.current;
                if (sess?.user?.id) {
                    identifyUser(sess.user.id, {
                        name: sess.user.name,
                        email: sess.user.email,
                    });
                    trackRoomJoin(roomId);
                }
            })
            .catch(err => {
                // Ignore aborted fetches (caused by effect cleanup on re-render)
                if (err.name === 'AbortError') return;
                console.error('Failed to load room:', err);
                // Don't report expected errors to Sentry
                if (err.message !== 'Session expired' && err.message !== 'Room not found') {
                    Sentry.captureException(err, {
                        tags: { component: 'room-init', roomId },
                        extra: { userAgent: navigator.userAgent },
                    });
                }
                if (err.message === 'Room not found') {
                    setError(err.message);
                } else if (err.message !== 'Session expired') {
                    setError("Failed to load room data. Please try refreshing.");
                }
            });

        // NOTE: Socket connection is now handled separately based on sync state without queue dependency
        // This prevents unnecessary WebSocket connections for solo listeners
        return () => abortController.abort();
    }, [roomId, status]);

    // Restore saved theme from local storage when boughtThemes are available
    useEffect(() => {
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme === 'love' && boughtThemes.includes('love')) {
            setTheme('love');
        } else if (savedTheme === 'default') {
            setTheme('default');
        }
    }, [boughtThemes]);

    // Handle WebSocket connection when sync is enabled
    const handleEnableSync = useCallback(() => {
        if (isSyncEnabled || isSyncConnecting) return; // Already enabled or connecting

        if (!isPremium && !isHostPremium) {
            setPremiumTrigger('sync_limit');
            setShowPremiumModal(true);
            return;
        }

        console.log('[Sync] Enabling room sync...');
        setIsSyncConnecting(true); // Show loading spinner
        const socket = connectSocket();
        socket.emit('join-room', roomId);

        const userId = session?.user?.id;
        const userName = session?.user?.name;
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
    }, [roomId, session, isSyncEnabled, isSyncConnecting, isPremium, isHostPremium]);

    // Auto-enable sync if URL has ?sync=true (for shared links)
    // Only enables when host (or user) is premium - no paywall for URL-based joins
    // Re-runs automatically when isHostPremium loads from the API
    useEffect(() => {
        if (status !== "authenticated") return;
        const syncParam = searchParams.get('sync');
        if (syncParam === 'true' && !isSyncEnabled && (isPremium || isHostPremium)) {
            handleEnableSync();
        }
    }, [searchParams, status, isSyncEnabled, isPremium, isHostPremium, handleEnableSync]);

    // Refs for values needed inside the consolidated socket effect (avoids stale closures
    // and prevents the effect from re-running when these change)
    const isSyncConnectingRef = useRef(isSyncConnecting);
    useEffect(() => { isSyncConnectingRef.current = isSyncConnecting; }, [isSyncConnecting]);


    // Consolidated socket effect: connect + ALL listeners in one place.
    // This guarantees listeners are always on the correct socket instance.
    useEffect(() => {
        if (!isSyncEnabled) return;
        if (status !== "authenticated") return;

        console.log('[Sync] Setting up socket connection and all listeners...');
        const socket = connectSocket();
        socket.emit('join-room', roomId);

        // Emit presence join using ref to avoid session dependency
        const sess = sessionRef.current;
        const userId = sess?.user?.id;
        const userName = sess?.user?.name;
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

        // --- Helper: re-join room and refresh state (debounced to prevent double refresh) ---
        let rejoinTimer: ReturnType<typeof setTimeout> | null = null;
        const rejoinRoom = () => {
            console.log('[Sync] Re-joining room and refreshing queue...');
            socket.emit('join-room', roomId);
            const sess = sessionRef.current;
            const userId = sess?.user?.id;
            const userName = sess?.user?.name;
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
            // Debounce refresh — reconnect + visibility change can fire back-to-back
            if (rejoinTimer) clearTimeout(rejoinTimer);
            rejoinTimer = setTimeout(() => {
                refreshQueueRef.current();
                rejoinTimer = null;
            }, 300);
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
        // Guards: ignore if a local song change is pending/recent (prevents revert on iOS tab return)
        const onVideoChanged = async (newVideoId: string) => {
            try {
                // If a local song change PATCH is in-flight, ignore server events entirely
                if (pendingChangeRef.current) {
                    console.log(`[video-changed] Ignored (pending local change in-flight)`);
                    return;
                }
                // If a local action was very recent, ignore — our PATCH may not have reached server yet
                if (Date.now() - localIndexChangeRef.current < 8000) {
                    console.log(`[video-changed] Ignored (local action recent, ${Date.now() - localIndexChangeRef.current}ms ago)`);
                    return;
                }

                let activeQueue = queueRef.current;
                let idx = activeQueue.findIndex(item => item.videoId === newVideoId);
                console.log(`[video-changed] Received newVideoId: ${newVideoId}, found at index: ${idx}`);
                if (idx === -1) {
                    // Queue might not be synced yet — refresh and retry once
                    console.log(`[video-changed] VideoId not in local queue, refreshing...`);
                    const refreshedData = await refreshQueueRef.current();
                    if (refreshedData) {
                        activeQueue = refreshedData.queue;
                        idx = activeQueue.findIndex((item: { videoId: string }) => item.videoId === newVideoId);
                    }
                }
                if (idx !== -1) {
                    // Do NOT set localIndexChangeRef here — it guards LOCAL actions only.
                    // Setting it here would block all subsequent remote events for 8s.
                    setCurrentQueueIndex(idx);
                    setVideoId(activeQueue[idx].videoId);
                    setCurrentSong(activeQueue[idx]);
                } else {
                    console.warn(`[video-changed] VideoId ${newVideoId} not found even after refresh`);
                }
            } catch (err) {
                console.error('[video-changed] Error handling video change:', err);
            }
        };
        socket.on('video-changed', onVideoChanged);

        // --- Queue updated listener ---
        // Receives the full item from the sender and appends directly (no GET re-fetch needed).
        // The socket server broadcasts the item object directly (see socketService.ts:358).
        const onQueueUpdated = (item: { id: string; videoId: string; title: string; thumbnail?: string; order: number }) => {
            if (!item?.id) return;
            console.log('[Socket] received queue-updated; appending item directly:', item.title);
            setQueue(prev => {
                if (prev.some(q => q.id === item.id)) return prev; // dedup guard
                return [...prev, item];
            });
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
            if (rejoinTimer) clearTimeout(rejoinTimer);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            socket.off('connect', onReconnect);
            socket.off('room-presence', onPresence);
            socket.off('video-changed', onVideoChanged);
            socket.off('queue-updated', onQueueUpdated);
            socket.off('queue-removed', onQueueRemoved);
            socket.off('theme-changed', onThemeChanged);
            const sess = sessionRef.current;
            const leaveUserId = sess?.user?.id;
            if (leaveUserId) {
                socket.emit('leave-room', { roomId, userId: leaveUserId });
            }
            disconnectSocket();
        };
    }, [isSyncEnabled, roomId, status]);


    // REMOVED: derivation useEffect [queue, currentQueueIndex] → setVideoId
    // This was the root cause of song mismatch on iOS. Any setQueue() call created
    // a new array reference, triggering this effect with potentially stale currentQueueIndex.
    // Instead, videoId and currentSong are now set DIRECTLY at every mutation site.

    // Helper: refetch queue from backend to ensure canonical IDs/order
    // Mutex: only one in-flight at a time. Skips entirely if a song change PATCH is pending.
    const refreshQueue = useCallback(async () => {
        if (refreshInFlightRef.current) return null;
        if (pendingChangeRef.current) return null;
        refreshInFlightRef.current = true;
        try {
            const queueUrl = `/api/rooms/${roomId}/queue`;
            const res = await fetch(queueUrl);
            if (!res.ok) return null;
            const data = await res.json();
            // Double-check pending change hasn't started while fetch was in-flight
            if (pendingChangeRef.current) return data;

            // Only call setQueue if items actually changed (prevents unnecessary re-renders
            // that used to trigger the now-removed derivation useEffect)
            const oldIds = queueRef.current.map(q => q.videoId).join(',');
            const newIds = (data.queue as { videoId: string }[]).map(q => q.videoId).join(',');
            const queueItemsChanged = oldIds !== newIds;

            const isLocalActionRecent = Date.now() - localIndexChangeRef.current < 8000;
            if (!isLocalActionRecent) {
                // Safe to apply full server state
                if (queueItemsChanged) setQueue(data.queue);
                setCurrentQueueIndex(data.currentQueueIndex);
                if (data.queue.length > 0 && data.queue[data.currentQueueIndex]) {
                    setVideoId(data.queue[data.currentQueueIndex].videoId);
                    setCurrentSong(data.queue[data.currentQueueIndex]);
                } else {
                    setVideoId('');
                    setCurrentSong(null);
                }
            } else if (queueItemsChanged) {
                // Local action recent — only update queue items (adds/removes), NOT the current index/video
                setQueue(data.queue);
            }
            return data;
        } finally {
            refreshInFlightRef.current = false;
        }
    }, [roomId]);

    // Keep a stable ref to refreshQueue so socket listeners never need it as a dependency
    const refreshQueueRef = useRef(refreshQueue);
    useEffect(() => { refreshQueueRef.current = refreshQueue; }, [refreshQueue]);

    // Explicit-trigger search: fires only on Enter / button click, not on typing.
    // Cuts quota burn from intermediate keystrokes (e.g. "arij" → "arijit" → "arijit singh").
    const executeSearch = useCallback(async (q: string) => {
        const trimmed = q.trim();
        if (trimmed.length < 3) return;
        if (trimmed === lastSearchedRef.current) return; // no-op if unchanged from last submit
        lastSearchedRef.current = trimmed;
        setSubmittedQuery(trimmed);

        setSearchLoading(true);
        setSearchError('');
        try {
            const res = await fetch(`/api/rooms/${roomId}/search?q=${encodeURIComponent(trimmed)}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if (res.status === 429 && errData.upgradeRequired) {
                    // Free user hit daily search cap → push upgrade modal
                    setPremiumTrigger('search_limit');
                    setShowPremiumModal(true);
                    const hrs = errData.resetInHours ?? 24;
                    setSearchError(`Daily limit reached. Resets in ${hrs}h - or upgrade for unlimited search + playlist import.`);
                    setSearchResults([]);
                    return;
                }
                if (res.status === 503 && errData.quotaExceeded) {
                    // All YouTube keys exhausted (affects everyone — premium too)
                    const hrs = errData.estimatedResetHours ?? 24;
                    setSearchError(`Search temporarily unavailable (resumes in ~${hrs}h). Tip: use Playlist Import to bulk-add songs instead.`);
                    setSearchResults([]);
                    return;
                }
                throw new Error('Search failed');
            }
            const data = await res.json();
            setSearchResults(data);
            setSuggestions([]);
            trackEvent('search_submitted', { query_length: trimmed.length, result_count: data.length });
        } catch (err) {
            setSearchError('Failed to search. Try again.');
            console.error('Search failed:', err);
        } finally {
            setSearchLoading(false);
        }
    }, [roomId]);

    // Clear stale results/errors when the user empties the input (no API call fired).
    useEffect(() => {
        if (!search.trim()) {
            setSearchResults([]);
            setSearchError('');
            lastSearchedRef.current = '';
            setSubmittedQuery('');
            setSuggestions([]);
        }
    }, [search]);

    // Debounced zero-API suggestions: fetches from local library + Redis cached-query index.
    // Never touches YouTube. Guides users toward queries we can serve for free.
    useEffect(() => {
        const q = search.trim();
        if (q.length < 2) { setSuggestions([]); return; }
        // Don't show suggestions when input matches the query we just searched
        if (q === lastSearchedRef.current) { setSuggestions([]); return; }

        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            try {
                const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q)}`, {
                    signal: controller.signal,
                });
                if (!res.ok) return;
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            } catch {
                // Suggestions are non-critical - silent fail (includes AbortError)
            }
        }, 150);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [search]);

    const handleSuggestionClick = (label: string, source: 'library' | 'cached') => {
        setSearch(label);
        setSuggestions([]);
        trackEvent('suggestion_clicked', { source, query_length: label.length });
        executeSearch(label);
    };

    // Add to queue handler (optimistic update; then reconcile with server response)
    const handleAddToQueue = async (item: { videoId: string; title: string; thumbnail?: string }) => {
        setModalOpen(false);

        // Capture state before optimistic add
        const wasEmpty = queueRef.current.length === 0;
        const atFreeLimit = !isPremium && queueRef.current.length >= 5;

        // Optimistic update: add temp item immediately (skip if free user at queue limit
        // to avoid a brief flash of 6 items before the 403 removes it)
        const tempId = `temp-${Date.now()}`;
        const tempItem = {
            id: tempId, videoId: item.videoId, title: item.title,
            thumbnail: item.thumbnail ?? '', order: (queueRef.current.at(-1)?.order ?? -1) + 1
        };
        if (!atFreeLimit) {
            setQueue(prev => [...prev, tempItem]);
            if (wasEmpty) {
                setCurrentQueueIndex(0);
                setVideoId(item.videoId);
                setCurrentSong(tempItem);
            }
        }

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
                    // Revert optimistic add (no-op if atFreeLimit since we skipped it)
                    setQueue(prev => prev.filter(q => q.id !== tempId));
                    if (wasEmpty) { setCurrentQueueIndex(-1); setCurrentSong(null); setVideoId(''); }
                    setPremiumTrigger('queue_limit');
                    setShowPremiumModal(true);
                    return;
                }
            }

            if (!res.ok) throw new Error('Add failed');

            // Reconcile: replace temp item with real server item
            const newItem = await res.json();
            if (!atFreeLimit) {
                setQueue(prev => prev.map(q => q.id === tempId ? newItem : q));
                if (wasEmpty) setCurrentSong(newItem);
            } else {
                // Was server-first (skipped optimistic), add now
                setQueue(prev => [...prev, newItem]);
                if (wasEmpty) {
                    setCurrentQueueIndex(0);
                    setVideoId(newItem.videoId);
                    setCurrentSong(newItem);
                }
            }

            // Emit full item via socket so other clients can append directly (no GET needed)
            if (isSyncEnabled) {
                const socket = getSocket();
                if (socket) {
                    console.log('[Socket] emitting queue-updated', { roomId, item: newItem });
                    socket.emit('queue-updated', { roomId, item: newItem });
                }
            }
        } catch {
            // Revert optimistic add on network/server error
            setQueue(prev => prev.filter(q => q.id !== tempId));
            if (wasEmpty) { setCurrentQueueIndex(-1); setCurrentSong(null); setVideoId(''); }
            console.error('Failed to add to queue');
        }
    };

    // Helper: persist currentIndex to backend with retry (replaces fire-and-forget PATCH)
    // Keeps pendingChangeRef true to block refreshQueue from overwriting local state
    const persistCurrentIndex = async (index: number) => {
        pendingChangeRef.current = true;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const res = await fetch(`/api/rooms/${roomId}/queue`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentIndex: index })
                });
                if (res.ok) break;
            } catch (err) {
                if (attempt === 2) console.error('[Queue] Failed to persist currentIndex after retries:', err);
                // Wait before retrying (iOS network may need time after tab return)
                await new Promise(r => setTimeout(r, 500));
            }
        }
        pendingChangeRef.current = false;
    };

    // Helper: emit change-video with reconnect resilience
    // Uses a ref so multiple calls while disconnected only emit the LATEST videoId on reconnect
    const emitChangeVideo = (newVideoId: string) => {
        if (!isSyncEnabled) return;
        const socket = getSocket();
        if (socket?.connected) {
            socket.emit('change-video', { roomId, newVideoId });
        } else if (socket) {
            pendingEmitVideoRef.current = newVideoId;
            if (!emitOnConnectRegisteredRef.current) {
                emitOnConnectRegisteredRef.current = true;
                socket.once('connect', () => {
                    emitOnConnectRegisteredRef.current = false;
                    if (pendingEmitVideoRef.current) {
                        socket.emit('change-video', { roomId, newVideoId: pendingEmitVideoRef.current });
                        pendingEmitVideoRef.current = null;
                    }
                });
            }
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

            localIndexChangeRef.current = Date.now();
            setCurrentQueueIndex(newIndex);
            setVideoId(currentQueue[newIndex].videoId);
            setCurrentSong(currentQueue[newIndex]);

            // Emit socket event immediately for real-time sync
            emitChangeVideo(currentQueue[newIndex].videoId);

            // Persist to backend with retry (blocks refreshQueue from overwriting)
            persistCurrentIndex(newIndex);
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
            setVideoId(currentQueue[newIndex].videoId);
            setCurrentSong(currentQueue[newIndex]);

            // Emit socket event immediately for real-time sync
            emitChangeVideo(currentQueue[newIndex].videoId);

            // Persist to backend with retry (blocks refreshQueue from overwriting)
            persistCurrentIndex(newIndex);
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

    if (status === "loading" || status === "unauthenticated" || (!roomDetails && !error)) {
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
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center text-red-500">
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-red-500/20 backdrop-blur-sm max-w-sm">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        {isRoomDeleted ? (
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
                        {isRoomDeleted ? 'Room Deleted' : 'Error'}
                    </p>
                    <p className="text-sm text-red-200/70 mb-6">
                        {isRoomDeleted
                            ? 'This room has been deleted by the host.'
                            : error}
                    </p>
                    {isRoomDeleted ? (
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
                        {/* Participants (avatars) */}
                        <>
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

                        {/* Enable Sync Button / Connecting Spinner / Live Indicator */}
                        {!isSyncEnabled && !isSyncConnecting ? (
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

                        {/* Invite Button */}
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                        onClick={(e) => {
                                            if (!isPremium) {
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
                                        <DialogTitle>Invite to Room with real-time sync</DialogTitle>
                                    </VisuallyHidden>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Share2 className="w-6 h-6 text-red-400" />
                                        <h2 className="text-lg font-bold">Invite to Room with real-time sync</h2>
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
                                            className={`h-12 px-4 bg-gradient-to-r ${currentTheme.buttonGradient} text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105`}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </Button>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        Share this link to invite others to your music room.
                                    </div>
                                </DialogContent>
                            </Dialog>
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
                    {/* Search Card */}
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
                                            <form
                                                onSubmit={(e) => { e.preventDefault(); executeSearch(search); }}
                                                className="relative"
                                            >
                                                <input
                                                    type="text"
                                                    className={`w-full rounded-xl px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 pr-20 sm:pr-24 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 ${theme === 'love' ? 'focus:ring-pink-500' : 'focus:ring-red-500'} focus:border-transparent transition-all text-sm sm:text-base`}
                                                    placeholder="Type a song or artist, then press Enter..."
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                    autoFocus
                                                />
                                                <Search className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'love' ? 'text-pink-300' : 'text-red-300'}`} />
                                                <div className="absolute right-2 sm:right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                                    {searchLoading ? (
                                                        <div className={`w-5 h-5 border-2 rounded-full animate-spin ${currentTheme.searchLoading}`}></div>
                                                    ) : (
                                                        <button
                                                            type="submit"
                                                            disabled={search.trim().length < 3 || searchLoading}
                                                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${search.trim().length < 3 || searchLoading
                                                                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                                                : theme === 'love'
                                                                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                                                                    : 'bg-red-500 text-white hover:bg-red-600'
                                                                }`}
                                                        >
                                                            Search
                                                        </button>
                                                    )}
                                                </div>
                                                {suggestions.length > 0 && !searchLoading && searchResults.length === 0 && (
                                                    <div className={`absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border ${theme === 'love' ? 'border-pink-500/30' : 'border-red-500/30'} rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto custom-scrollbar`}>
                                                        {suggestions.map((s, i) => (
                                                            <button
                                                                key={`${s.source}-${i}`}
                                                                type="button"
                                                                onClick={() => handleSuggestionClick(s.label, s.source)}
                                                                className={`w-full text-left px-3 py-2.5 text-sm text-white flex items-center gap-2.5 transition-all border-b border-white/5 last:border-b-0 ${theme === 'love' ? 'hover:bg-pink-500/20' : 'hover:bg-red-500/20'}`}
                                                            >
                                                                {s.source === 'library' ? (
                                                                    <Music className={`w-3.5 h-3.5 flex-shrink-0 ${theme === 'love' ? 'text-pink-300' : 'text-red-300'}`} />
                                                                ) : (
                                                                    <Search className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
                                                                )}
                                                                <span className="truncate flex-1">{s.label}</span>
                                                                {s.source === 'cached' && (
                                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0 uppercase tracking-wider font-semibold">cached</span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </form>
                                        </div>

                                        {searchError && (
                                            <div className={`p-2 sm:p-3 ${currentTheme.subtleBg} border ${currentTheme.border} rounded-lg ${currentTheme.text} text-xs sm:text-sm`}>
                                                {searchError}
                                            </div>
                                        )}

                                        <div className={`${suggestions.length > 0 ? 'min-h-[280px]' : ''} max-h-60 sm:max-h-96 overflow-y-auto custom-scrollbar`}>
                                            {searchResults.length === 0 && !searchLoading && !search.trim() && suggestions.length === 0 && (
                                                <div className="text-center py-8 sm:py-12">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Music className={`w-6 h-6 sm:w-8 sm:h-8 ${theme === 'love' ? 'text-pink-300' : 'text-red-300'}`} />
                                                    </div>
                                                    <p className={`${currentTheme.text} font-medium text-sm sm:text-base`}>What are we listening to?</p>
                                                    <p className={`text-xs sm:text-sm ${currentTheme.text} mt-1`}>Search for any song, artist, or album</p>
                                                </div>
                                            )}
                                            {searchResults.length === 0 && !searchLoading && search.trim() && search.trim() !== submittedQuery && suggestions.length === 0 && (
                                                <div className="text-center py-8 sm:py-12">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Search className={`w-6 h-6 sm:w-8 sm:h-8 ${theme === 'love' ? 'text-pink-300' : 'text-red-300'}`} />
                                                    </div>
                                                    <p className={`${currentTheme.text} font-medium text-sm sm:text-base`}>
                                                        Press Enter to search for &ldquo;{search.trim()}&rdquo;
                                                    </p>
                                                    <p className={`text-xs sm:text-sm ${currentTheme.text} mt-1`}>Or click the Search button</p>
                                                </div>
                                            )}
                                            {searchResults.length === 0 && !searchLoading && search.trim() === submittedQuery && submittedQuery !== '' && (
                                                <div className="text-center py-8 sm:py-12">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Search className={`w-6 h-6 sm:w-8 sm:h-8 ${theme === 'love' ? 'text-pink-300' : 'text-red-300'}`} />
                                                    </div>
                                                    <p className={`${currentTheme.text} font-medium text-sm sm:text-base`}>
                                                        No results for &ldquo;{submittedQuery}&rdquo;
                                                    </p>
                                                    <p className={`text-xs sm:text-sm ${currentTheme.text} mt-1`}>Try different keywords or check spelling</p>
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
                                                onPlayNext={handlePlayNext}
                                                onPlayPrev={handlePlayPrev}
                                                songTitle={currentSong?.title}
                                                thumbnailUrl={currentSong?.thumbnail}
                                                theme={theme}
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
                                                    setVideoId(queue[idx].videoId);
                                                    setCurrentSong(queue[idx]);
                                                    // Trigger playVideo synchronously within the click event
                                                    // so iOS recognizes it as a user gesture
                                                    syncAudioRef.current?.playVideo();
                                                    // Emit socket event immediately for real-time sync
                                                    emitChangeVideo(queue[idx].videoId);
                                                    // Persist to backend with retry (blocks refreshQueue from overwriting)
                                                    persistCurrentIndex(idx);
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
          background: ${theme === 'love' ? 'rgba(236, 72, 153, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'love' ? 'rgba(236, 72, 153, 0.7)' : 'rgba(239, 68, 68, 0.7)'};
        }
      `}</style>

        </div>
    );
}