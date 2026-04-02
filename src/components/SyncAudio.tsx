// components/SyncAudio.tsx
'use client';
import { CirclePlay, CirclePause, SkipForward, SkipBack } from 'lucide-react';
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Script from 'next/script';
import { useSyncPlayer } from '../hooks/useSyncPlayer';
import { getSocket } from '../lib/socket';

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace YT {
  class Player {
    constructor(elementId: string, options: { videoId?: string; playerVars?: Record<string, unknown>; events?: Record<string, unknown> });
    loadVideoById(videoId: string): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    playVideo(): void;
    pauseVideo(): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    getVolume(): number;
    setVolume(volume: number): void;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): number;
    destroy(): void;
  }
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
  }
}

interface Props {
  roomId: string;
  videoId: string;  // initial video
  isHost: boolean;
  isEventMode?: boolean;
  onPlayNext?: () => void;
  onPlayPrev?: () => void;
  songTitle?: string;
  thumbnailUrl?: string;
  theme?: 'default' | 'love';
  currentQueueIndex?: number;
  onSyncTrackChange?: (index: number) => void;
}

const BUFFER = 1000; // ms buffer for scheduling

// Helper function to format time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export interface SyncAudioHandle {
  playVideo: () => void;
  unMuteAndPlay: () => void;
}

const SyncAudio = forwardRef<SyncAudioHandle, Props>(function SyncAudio({ roomId, videoId, isHost, isEventMode = false, onPlayNext, onPlayPrev, songTitle, thumbnailUrl, theme = 'default', currentQueueIndex, onSyncTrackChange }, ref) {
  /* eslint-disable jsx-a11y/media-has-caption */
  const playerRef = useRef<YT.Player | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Silent audio ref
  const socket = getSocket(); // May be null if sync not enabled
  const { offset, sendCommand } = useSyncPlayer(roomId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // true on initial mount
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false); // Track if user has started playback
  const hasStartedPlaybackRef = useRef(false);
  const pendingAutoPlayRef = useRef(false); // Track if we should auto-play after video loads
  const [showGuestToast, setShowGuestToast] = useState(false);
  const [guestToastMessage, setGuestToastMessage] = useState('Only host can control — sit back and enjoy!');
  const guestToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hostPaused, setHostPaused] = useState(false); // event mode: true when host has intentionally paused
  const hostPausedRef = useRef(false); // ref mirror so closures always read latest value
  const onPlayNextRef = useRef(onPlayNext); // ref to avoid stale closure in YouTube player callback
  const onPlayPrevRef = useRef(onPlayPrev);

  const currentQueueIndexRef = useRef(currentQueueIndex);
  const onSyncTrackChangeRef = useRef(onSyncTrackChange);
  const pendingSyncAfterTrackChangeRef = useRef<{ isPlaying: boolean; seekTime: number; timestamp: number } | null>(null);

  // Keep refs in sync with latest props/state
  useEffect(() => { onPlayNextRef.current = onPlayNext; }, [onPlayNext]);
  useEffect(() => { onPlayPrevRef.current = onPlayPrev; }, [onPlayPrev]);
  useEffect(() => { currentQueueIndexRef.current = currentQueueIndex; }, [currentQueueIndex]);
  useEffect(() => { onSyncTrackChangeRef.current = onSyncTrackChange; }, [onSyncTrackChange]);

  // Keep ref in sync with state
  useEffect(() => { hostPausedRef.current = hostPaused; }, [hostPaused]);
  useEffect(() => { hasStartedPlaybackRef.current = hasStartedPlayback; }, [hasStartedPlayback]);

  // Expose playVideo and unMuteAndPlay to parent for iOS gesture requirements
  useImperativeHandle(ref, () => ({
    playVideo: () => {
      const p = playerRef.current;
      if (p && typeof p.playVideo === 'function') {
        p.playVideo();
      }
    },
    unMuteAndPlay: () => {
      const p = playerRef.current;
      if (p) {
        console.log('[SyncAudio] unMuteAndPlay called. isMuted:', typeof p.isMuted === 'function' ? p.isMuted() : 'N/A', 'volume:', typeof p.getVolume === 'function' ? p.getVolume() : 'N/A', 'state:', typeof p.getPlayerState === 'function' ? p.getPlayerState() : 'N/A');
        if (typeof p.unMute === 'function') p.unMute();
        if (typeof p.setVolume === 'function') p.setVolume(100);
        if (typeof p.playVideo === 'function') p.playVideo();
        console.log('[SyncAudio] After unMute. isMuted:', typeof p.isMuted === 'function' ? p.isMuted() : 'N/A', 'volume:', typeof p.getVolume === 'function' ? p.getVolume() : 'N/A');
      } else {
        console.log('[SyncAudio] unMuteAndPlay: playerRef is null');
      }
    },
  }));

  const themeStyles = {
    default: {
      buttonBg: "bg-red-100 hover:bg-red-200",
      buttonText: "text-red-500",
      buttonRing: "focus:ring-red-300",
      playButtonGradient: "from-red-200 to-white hover:from-red-300 hover:to-white text-red-600",
      spinner: "text-red-500",
      timerText: "text-red-500",
      seekBarBg: "bg-red-100/40",
      seekBarColor: "#f87171", // red-400
      seekBarThumbShadow: "rgba(248, 113, 113, 0.3)",
    },
    love: {
      buttonBg: "bg-pink-100 hover:bg-pink-200",
      buttonText: "text-pink-500",
      buttonRing: "focus:ring-pink-300",
      playButtonGradient: "from-pink-100 to-white hover:from-pink-200 hover:to-white text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
      spinner: "text-pink-500",
      timerText: "text-pink-300",
      seekBarBg: "bg-pink-500/20",
      seekBarColor: "#ec4899", // pink-500
      seekBarThumbShadow: "rgba(236, 72, 153, 0.5)",
    }
  };

  const currentTheme = themeStyles[theme];

  // 1) Initialize YouTube IFrame API once
  const playerInitialized = useRef(false);
  useEffect(() => {
    let destroyed = false;
    if (playerInitialized.current) return;
    playerInitialized.current = true;

    const createPlayer = () => {
      if (destroyed) return;
      if (playerRef.current) return; // Only create one player
      if (!window.YT || !window.YT.Player) return; // Wait until API ready
      console.log('▶️ Creating YT Player instance');
      // For event guests: start muted with autoplay so the video is already
      // playing behind the overlay. On "Tap to Join" we just unmute — this
      // bypasses iOS Chrome's restriction that playVideo() must originate
      // from a user gesture (postMessage to the iframe loses gesture context).
      const isEventGuest = !isHost && isEventMode;
      playerRef.current = new window.YT.Player('audio-player', {
        videoId,
        playerVars: {
          autoplay: isEventGuest ? 1 : 0,
          controls: 0, modestbranding: 1, rel: 0, playsinline: 1,
        },
        events: {
          onReady: () => {
            console.log('🛠️ YouTube Player Ready');
            const player = playerRef.current;
            if (player) {
              // Mute immediately for event guests — they'll unmute on tap
              if (isEventGuest) {
                player.mute();
                console.log('[SyncAudio] Event guest: muted player for autoplay');
              }
              setDuration(player.getDuration());
              const state = player.getPlayerState ? player.getPlayerState() : null;
              if (state !== window.YT.PlayerState.BUFFERING) {
                setIsLoading(false);
              }
            }
          },
          onStateChange: (e: { data: number }) => {
            console.log('StateChange:', e.data);
            if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            else if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) setIsPlaying(false);
            if (e.data === window.YT.PlayerState.BUFFERING) setIsLoading(true);
            else if (
              e.data === window.YT.PlayerState.PLAYING ||
              e.data === window.YT.PlayerState.PAUSED ||
              e.data === window.YT.PlayerState.ENDED
            ) setIsLoading(false);
            if (e.data === window.YT.PlayerState.ENDED && isHost && onPlayNextRef.current) {
              onPlayNextRef.current();
            }
            // Auto-play on mobile after video loads (for queue selection)
            // Event guests: auto-play on track change only if host is currently playing
            if (e.data === window.YT.PlayerState.CUED) {
              // Apply deferred sync after track change (reconnection scenario)
              const pendingSync = pendingSyncAfterTrackChangeRef.current;
              if (pendingSync) {
                pendingSyncAfterTrackChangeRef.current = null;
                console.log('[SyncAudio] Video cued after track change, applying deferred sync');
                const elapsed = (Date.now() - pendingSync.timestamp) / 1000;
                const adjustedTime = elapsed <= 30
                  ? (pendingSync.isPlaying ? pendingSync.seekTime + elapsed : pendingSync.seekTime)
                  : pendingSync.seekTime;
                const p = playerRef.current;
                if (p && typeof p.seekTo === 'function') {
                  p.seekTo(adjustedTime, true);
                }
                hostPausedRef.current = !pendingSync.isPlaying;
                setHostPaused(!pendingSync.isPlaying);
                if (pendingSync.isPlaying && p && typeof p.playVideo === 'function') {
                  setTimeout(() => p.playVideo(), 100);
                }
                setHasStartedPlayback(true);
              } else if (!isHost && isEventMode && !hasStartedPlaybackRef.current) {
                // iOS Chrome autoplay: when event guest's video first CUEs,
                // play immediately — this is close to the "Tap to Join" gesture
                // so iOS Chrome still considers it user-activated.
                console.log('[SyncAudio] iOS: First CUED for event guest, auto-playing in gesture window');
                const p = playerRef.current;
                if (p && typeof p.playVideo === 'function') {
                  p.playVideo();
                }
                setHasStartedPlayback(true);
                hasStartedPlaybackRef.current = true;
              } else if (pendingAutoPlayRef.current) {
                console.log('[SyncAudio] Video cued, attempting auto-play for queue selection');
                pendingAutoPlayRef.current = false;
                const shouldAutoPlay = isHost || !isEventMode || !hostPausedRef.current;
                if (shouldAutoPlay) {
                  const p = playerRef.current;
                  if (p && typeof p.playVideo === 'function') {
                    setTimeout(() => p.playVideo(), 100); // Small delay for mobile
                  }
                }
              }
            }
          },
          onError: (e: unknown) => {
            console.error('YouTube Player Error', e);
            setIsLoading(false);
            setIsPlaying(false);
          },
        },
      });
      console.log('Player instance created');
    };

    console.log('🔧 Registering onYouTubeIframeAPIReady');
    window.onYouTubeIframeAPIReady = () => {
      console.log('onYouTubeIframeAPIReady fired');
      createPlayer();
    };

    // In case the script has already loaded before we set the callback
    if (window.YT && window.YT.Player) {
      createPlayer();
    }

    return () => {
      destroyed = true;
      playerInitialized.current = false;
      if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, []);

  // 2) React to local videoId prop changes
  // Track when videoId changes for auto-play logic
  const prevVideoIdRef = useRef(videoId);
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.loadVideoById !== 'function') return;

    const isVideoChange = prevVideoIdRef.current !== videoId;
    prevVideoIdRef.current = videoId;

    console.log('🔄 videoId prop changed:', videoId, 'isVideoChange:', isVideoChange);
    console.log('[SyncAudio] Loading video by ID:', videoId);

    // Always set pending auto-play when video changes (enables queue click on mobile)
    // This works because clicking queue item IS a user gesture, and we call playVideo after load
    if (isVideoChange) {
      pendingAutoPlayRef.current = true;
    }

    playerRef.current.loadVideoById(videoId);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
  }, [videoId]);

  // 3) Sync play/pause commands
  useEffect(() => {
    // Only set up socket listeners if socket is connected
    if (!socket) return;

    const onSync = ({ cmd, timestamp, seekTime }: { cmd: string; timestamp: number; seekTime: number }) => {
      // Track host's intentional pause/play for event guests
      if (!isHost && isEventMode) {
        hostPausedRef.current = cmd === 'pause';
        setHostPaused(cmd === 'pause');
      }
      const execAt = timestamp + offset;
      const delay = Math.max(execAt - Date.now(), 0);
      console.log(`🔄 Scheduling ${cmd} in ${delay}ms`);
      setTimeout(() => {
        const p = playerRef.current;
        if (!p || typeof p.seekTo !== 'function') return;
        p.seekTo(seekTime, true);
        if (cmd === 'play') p.playVideo(); else p.pauseVideo();
      }, delay);
    };
    socket.on('sync-command', onSync);
    return () => void socket.off('sync-command', onSync);
  }, [socket, offset]);

  // 5) Update current time and duration
  useEffect(() => {
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (player && !isSeeking) {
        // Safety check: ensure methods exist before calling
        const time = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : 0;
        const dur = typeof player.getDuration === 'function' ? player.getDuration() : 0;

        if (time > 0) setCurrentTime(time);
        if (dur > 0) setDuration(dur);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSeeking]);

  // 6) Media Session API (Background PWA support) - Enhanced for mobile lock screen controls
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    // Update metadata whenever song details change
    const updateMetadata = () => {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songTitle || 'Music Duo Session',
        artist: 'Jukebox Duo',
        artwork: [
          { src: thumbnailUrl || '/icons.svg', sizes: '96x96', type: 'image/png' },
          { src: thumbnailUrl || '/icons.svg', sizes: '128x128', type: 'image/png' },
          { src: thumbnailUrl || '/icons.svg', sizes: '192x192', type: 'image/png' },
          { src: thumbnailUrl || '/icons.svg', sizes: '256x256', type: 'image/png' },
          { src: thumbnailUrl || '/icons.svg', sizes: '384x384', type: 'image/png' },
          { src: thumbnailUrl || '/icons.svg', sizes: '512x512', type: 'image/png' },
        ]
      });
    };

    updateMetadata();

    // Action handlers for ALL users (controls their local playback from lock screen)
    // Play handler
    navigator.mediaSession.setActionHandler('play', () => {
      console.log('[MediaSession] Play clicked');
      // Event guests cannot override host pause from lock screen
      if (!isHost && isEventMode && hostPaused) return;
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error('Silent audio play failed', e));
      }
      const p = playerRef.current;
      if (p && typeof p.playVideo === 'function') {
        p.playVideo();
        // Host broadcasts sync command to other participants
        if (isHost) {
          const time = typeof p.getCurrentTime === 'function' ? p.getCurrentTime() : 0;
          sendCommand('play', time, Date.now() + BUFFER);
        }
      }
    });

    // Pause handler
    navigator.mediaSession.setActionHandler('pause', () => {
      console.log('[MediaSession] Pause clicked');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const p = playerRef.current;
      if (p && typeof p.pauseVideo === 'function') {
        p.pauseVideo();
        // Host broadcasts sync command to other participants
        if (isHost) {
          const time = typeof p.getCurrentTime === 'function' ? p.getCurrentTime() : 0;
          sendCommand('pause', time, Date.now() + BUFFER);
        }
      }
    });

    // Previous/Next track handlers (all users in normal rooms, host-only in event mode)
    if (isHost || !isEventMode) {
      if (onPlayPrev) navigator.mediaSession.setActionHandler('previoustrack', () => onPlayPrevRef.current?.());
      if (onPlayNext) navigator.mediaSession.setActionHandler('nexttrack', () => onPlayNextRef.current?.());
    }

    // Seek handlers (all users in normal rooms, host-only in event mode)
    if (isHost || !isEventMode) {
      // Seek to specific time handler (for lock screen progress scrubbing)
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        console.log('[MediaSession] Seek to:', details.seekTime);
        const p = playerRef.current;
        if (details.seekTime !== undefined && p && typeof p.seekTo === 'function') {
          p.seekTo(details.seekTime, true);
          setCurrentTime(details.seekTime);
          // Broadcast sync command to keep other participants in sync
          if (isPlaying) {
            sendCommand('play', details.seekTime, Date.now() + BUFFER);
          }
        }
      });

      // Seek forward handler (typically +10 seconds)
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        console.log('[MediaSession] Seek forward:', details.seekOffset);
        const p = playerRef.current;
        if (p && typeof p.getCurrentTime === 'function' && typeof p.getDuration === 'function') {
          const skipTime = details.seekOffset || 10;
          const newTime = Math.min(p.getCurrentTime() + skipTime, p.getDuration());
          p.seekTo(newTime, true);
          setCurrentTime(newTime);
          // Broadcast sync command to keep other participants in sync
          if (isPlaying) {
            sendCommand('play', newTime, Date.now() + BUFFER);
          }
        }
      });

      // Seek backward handler (typically -10 seconds)
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        console.log('[MediaSession] Seek backward:', details.seekOffset);
        const p = playerRef.current;
        if (p && typeof p.getCurrentTime === 'function') {
          const skipTime = details.seekOffset || 10;
          const newTime = Math.max(p.getCurrentTime() - skipTime, 0);
          p.seekTo(newTime, true);
          setCurrentTime(newTime);
          // Broadcast sync command to keep other participants in sync
          if (isPlaying) {
            sendCommand('play', newTime, Date.now() + BUFFER);
          }
        }
      });
    }

    return () => {
      // Clean up all handlers
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
    };
  }, [songTitle, thumbnailUrl, isHost, onPlayNext, onPlayPrev, sendCommand, isPlaying]);

  // 7) Update Media Session playback state (playing/paused indicator on lock screen)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // 8) Update Media Session position state (progress bar on lock screen)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!('setPositionState' in navigator.mediaSession)) return;

    // Only update if we have valid duration
    if (duration > 0 && currentTime >= 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1,
          position: Math.min(currentTime, duration) // Ensure position doesn't exceed duration
        });
      } catch (e) {
        // Position state can throw if values are invalid
        console.error('[MediaSession] Position state error:', e);
      }
    }
  }, [currentTime, duration]);

  // Sync silent audio state with React state (driven by YouTube state updates)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(e => console.error("Silent audio play err:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Host: send playback heartbeat every 5s so server can relay to late-joining guests
  useEffect(() => {
    if (!isHost || !isEventMode || !socket) return;
    const interval = setInterval(() => {
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== 'function') return;
      socket.emit('sync-heartbeat', {
        roomId,
        isPlaying,
        seekTime: p.getCurrentTime(),
        timestamp: Date.now(),
        currentQueueIndex: currentQueueIndexRef.current,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isHost, isEventMode, socket, roomId, isPlaying]);

  // Guest: request current playback state on mount to sync mid-song
  useEffect(() => {
    if (isHost || !isEventMode || !socket) return;

    const onSyncState = (data: { isPlaying: boolean; seekTime: number; timestamp: number; currentQueueIndex?: number }) => {
      const p = playerRef.current;
      if (!p || typeof p.seekTo !== 'function') return;

      // Track host's pause state for late-joining / refreshing guests
      hostPausedRef.current = !data.isPlaying;
      setHostPaused(!data.isPlaying);

      // If host is on a different track, switch to it first and defer seek
      if (data.currentQueueIndex !== undefined &&
          currentQueueIndexRef.current !== undefined &&
          data.currentQueueIndex !== currentQueueIndexRef.current &&
          onSyncTrackChangeRef.current) {
        console.log(`[SyncAudio] Sync-state: track mismatch. Local: ${currentQueueIndexRef.current}, Host: ${data.currentQueueIndex}. Switching track.`);
        pendingSyncAfterTrackChangeRef.current = {
          isPlaying: data.isPlaying,
          seekTime: data.seekTime,
          timestamp: data.timestamp,
        };
        onSyncTrackChangeRef.current(data.currentQueueIndex);
        return; // Seek will be applied after the new video loads (CUED handler)
      }

      // Staleness guard: if heartbeat is >30s old, don't trust the seek time
      const elapsed = (Date.now() - data.timestamp) / 1000;
      if (elapsed > 30) {
        console.log('[SyncAudio] Sync-state too stale (>30s), skipping seek adjustment');
        return;
      }

      const adjustedTime = data.isPlaying ? data.seekTime + elapsed : data.seekTime;

      p.seekTo(adjustedTime, true);
      if (data.isPlaying) {
        // Only call playVideo() if player isn't already playing.
        // On iOS Chrome, calling playVideo() from a socket callback gets blocked
        // (not a user gesture). If the player is already playing (from tap gesture
        // or CUED auto-play), seekTo() alone is enough.
        const currentState = typeof p.getPlayerState === 'function' ? p.getPlayerState() : null;
        if (currentState !== window.YT.PlayerState.PLAYING) {
          if (typeof p.playVideo === 'function') p.playVideo();
        }
        setIsPlaying(true);
        setHasStartedPlayback(true);
      } else {
        // Explicitly pause — seekTo can sometimes resume playback
        if (typeof p.pauseVideo === 'function') p.pauseVideo();
        setIsPlaying(false);
      }
    };

    socket.on('sync-state', onSyncState);
    // Request state after a short delay to let player initialize
    const timer = setTimeout(() => {
      socket.emit('sync-request', { roomId });
    }, 2000);

    return () => {
      socket.off('sync-state', onSyncState);
      clearTimeout(timer);
    };
  }, [isHost, isEventMode, socket, roomId]);

  // Show guest toast when non-host taps controls in event mode
  const triggerGuestToast = (message = 'Only host can control — sit back and enjoy!') => {
    if (guestToastTimerRef.current) clearTimeout(guestToastTimerRef.current);
    setGuestToastMessage(message);
    setShowGuestToast(true);
    guestToastTimerRef.current = setTimeout(() => setShowGuestToast(false), 3000);
  };

  // Handle seek bar change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const player = playerRef.current;
    if (!player || (!isHost && isEventMode)) return;

    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setIsSeeking(true);
  };

  // Handle seek bar mouse up (when user finishes seeking)
  const handleSeekEnd = () => {
    const player = playerRef.current;
    if (!player || (!isHost && isEventMode)) return;

    setIsSeeking(false);
    player.seekTo(currentTime, true);

    // If currently playing, send sync command
    if (isPlaying) {
      sendCommand('play', currentTime, Date.now() + BUFFER);
    }
  };

  return (
    <>
      <Script
        src="https://www.youtube.com/iframe_api"
        strategy="afterInteractive"
        onLoad={() => console.log('🔌 YouTube IFrame script loaded')}
      />

      {/* Hidden YouTube iframe */}
      <div id="audio-player" className="w-0 h-0 overflow-hidden" />

      {/* Silent Audio Hack for Background Play */}
      <audio
        ref={audioRef}
        src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////"
        loop
        playsInline
        className="fixed opacity-0 pointer-events-none top-0 left-0"
      />

      {/* Player controls — shown for all users, guest taps show toast */}
      <div className="mt-4 space-y-4 relative">
        {/* Guest toast popup */}
        {!isHost && isEventMode && showGuestToast && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-black/90 backdrop-blur-sm text-white text-sm px-4 py-2.5 rounded-xl border border-white/20 shadow-2xl whitespace-nowrap flex items-center gap-2">
              <span className="text-lg">{hostPaused ? '⏸️' : '🎧'}</span>
              <span>{guestToastMessage}</span>
            </div>
          </div>
        )}

        {/* Play controls */}
        <div className="flex justify-center items-center gap-6">
          <button
            className={`flex items-center cursor-pointer justify-center w-16 h-16 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonText} focus:outline-none focus:ring-2 ${currentTheme.buttonRing} transition-colors`}
            onClick={() => {
              if (!isHost && isEventMode) { triggerGuestToast(); return; }
              onPlayPrevRef.current?.();
            }}
            aria-label="Previous"
            type="button"
          >
            <SkipBack size={36} />
          </button>
          {!isPlaying && (
            <button
              className={`flex items-center cursor-pointer justify-center w-20 h-20 rounded-full bg-gradient-to-r ${currentTheme.playButtonGradient} focus:outline-none focus:ring-2 ${currentTheme.buttonRing} transition-colors shadow-lg relative ${!isHost && isEventMode && hostPaused ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => {
                // Event guest: blocked if host has paused
                if (!isHost && isEventMode) {
                  if (hostPaused) {
                    triggerGuestToast('Host paused the music — wait for them to resume');
                    return;
                  }
                  const p = playerRef.current;
                  if (!p || !videoId) return;

                  // Unlock audio on user gesture
                  if (audioRef.current) {
                    audioRef.current.play().catch(() => {});
                  }

                  // Request host's current position from server
                  if (socket) {
                    socket.emit('sync-request', { roomId });
                  }

                  // Start playback immediately (sync-state will adjust position)
                  if (typeof p.playVideo === 'function') p.playVideo();
                  setIsPlaying(true);
                  setHasStartedPlayback(true);
                  return;
                }

                const p = playerRef.current;
                if (!p || !videoId) return console.error('Player not ready or no video');
                if (typeof p.playVideo !== 'function') return console.error('playVideo not available');

                // Ensure silent audio plays on direct user interaction
                if (audioRef.current) {
                  audioRef.current.play().catch(e => console.error("Silent audio play rejected:", e));
                }

                p.playVideo();
                const time = typeof p.getCurrentTime === 'function' ? p.getCurrentTime() : 0;
                sendCommand('play', time, Date.now() + BUFFER);
                setIsPlaying(true);
                setHasStartedPlayback(true);
              }}
              aria-label="Play"
              type="button"
              disabled={(isHost || !isEventMode) && (isLoading || !videoId)}
            >
              {(isHost || !isEventMode) && isLoading ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className={`animate-spin h-8 w-8 ${currentTheme.spinner}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </span>
              ) : (
                <CirclePlay size={60} />
              )}
            </button>
          )}
          {isPlaying && (
            <button
              className={`flex items-center cursor-pointer justify-center w-20 h-20 rounded-full bg-gradient-to-r ${currentTheme.playButtonGradient} focus:outline-none focus:ring-2 ${currentTheme.buttonRing} transition-colors shadow-lg relative`}
              onClick={() => {
                // Event guest: pause locally only (no sync command)
                if (!isHost && isEventMode) {
                  const p = playerRef.current;
                  if (p && typeof p.pauseVideo === 'function') p.pauseVideo();
                  setIsPlaying(false);
                  return;
                }

                const p = playerRef.current;
                if (!p) return console.error('Player not ready');
                if (typeof p.pauseVideo !== 'function') return console.error('pauseVideo not available');

                p.pauseVideo();
                const time = typeof p.getCurrentTime === 'function' ? p.getCurrentTime() : 0;
                sendCommand('pause', time, Date.now() + BUFFER);
                setIsPlaying(false);
              }}
              aria-label="Pause"
              type="button"
              disabled={(isHost || !isEventMode) && isLoading}
            >
              {(isHost || !isEventMode) && isLoading ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className={`animate-spin h-8 w-8 ${currentTheme.spinner}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </span>
              ) : (
                <CirclePause size={60} />
              )}
            </button>
          )}
          <button
            className={`flex items-center cursor-pointer justify-center w-16 h-16 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonText} focus:outline-none focus:ring-2 ${currentTheme.buttonRing} transition-colors`}
            onClick={() => {
              if (!isHost && isEventMode) { triggerGuestToast(); return; }
              onPlayNextRef.current?.();
            }}
            aria-label="Next"
            type="button"
          >
            <SkipForward size={36} />
          </button>
        </div>

        {/* Mobile hint - shows only for host on mobile before first playback */}
        {(isHost || !isEventMode) && !hasStartedPlayback && !isPlaying && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 md:hidden mt-2 animate-pulse">
            ▶️ Tap the play button to start
          </p>
        )}

        {/* Timer and Seek Bar */}
        <div className="w-full">
          <div className="flex items-center gap-1 mb-2">
            <span className={`text-xs font-mono ${currentTheme.timerText} min-w-[30px]`}>
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative min-w-0">
              {(isHost || !isEventMode) ? (
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  className={`w-full h-3 ${currentTheme.seekBarBg} rounded-lg appearance-none cursor-pointer slider`}
                  style={{
                    background: `linear-gradient(to right, ${currentTheme.seekBarColor} 0%, ${currentTheme.seekBarColor} ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.5) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.5) 100%)`
                  }}
                />
              ) : (
                <div
                  onClick={isEventMode ? () => triggerGuestToast() : undefined}
                  className={`w-full h-3 ${currentTheme.seekBarBg} rounded-lg relative overflow-hidden cursor-pointer`}
                  style={{
                    background: `linear-gradient(to right, ${currentTheme.seekBarColor} 0%, ${currentTheme.seekBarColor} ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.5) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.5) 100%)`
                  }}
                />
              )}
            </div>
            <span className={`text-xs font-mono ${currentTheme.timerText} min-w-[30px]`}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: ${currentTheme.seekBarColor};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: ${currentTheme.seekBarColor};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px ${currentTheme.seekBarThumbShadow};
        }
      `}</style>
    </>
  );
});

export default SyncAudio;
