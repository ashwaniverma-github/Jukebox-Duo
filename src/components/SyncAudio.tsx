// components/SyncAudio.tsx
'use client';
import { CirclePlay, CirclePause, SkipForward, SkipBack } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
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
  onPlayNext?: () => void;
  onPlayPrev?: () => void;
}

const BUFFER = 1000; // ms buffer for scheduling

// Helper function to format time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function SyncAudio({ roomId, videoId, isHost, onPlayNext, onPlayPrev }: Props) {
  const playerRef = useRef<YT.Player | null>(null);
  const socket = getSocket();
  const { offset, sendCommand } = useSyncPlayer(roomId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // true on initial mount

  // 1) Initialize YouTube IFrame API once
  const playerInitialized = useRef(false);
  useEffect(() => {
    let destroyed = false;
    if (playerInitialized.current) return;
    playerInitialized.current = true;
    console.log('🔧 Registering onYouTubeIframeAPIReady');
    window.onYouTubeIframeAPIReady = () => {
      if (destroyed) return;
      if (playerRef.current) return; // Only create one player
      console.log('▶️ onYouTubeIframeAPIReady fired');
      playerRef.current = new window.YT.Player('audio-player', {
        videoId,
        playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: () => {
            console.log('🛠️ YouTube Player Ready');
            // Get initial duration
            const player = playerRef.current;
            if (player) {
              setDuration(player.getDuration());
              // Set loading false if not buffering
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
            // Set loading state
            if (e.data === window.YT.PlayerState.BUFFERING) setIsLoading(true);
            else if (e.data === window.YT.PlayerState.PLAYING || e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) setIsLoading(false);
            // Auto-advance to next song if host and song ended
            if (e.data === window.YT.PlayerState.ENDED && isHost && typeof onPlayNext === 'function') {
              onPlayNext();
            }
          },
        },
      });
      console.log('Player instance created');
    };
    return () => {
      destroyed = true;
      playerInitialized.current = false;
      if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, []);

  // 2) React to local videoId prop changes (host only)
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.loadVideoById !== 'function') return;
    console.log('🔄 videoId prop changed:', videoId);
    console.log('[SyncAudio] Loading video by ID:', videoId);
    playerRef.current.loadVideoById(videoId);
    // Reset time states
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true); // Set loading true when video changes
    // If the player is playing after loading, pause it to prevent double playback
    setTimeout(() => {
      if (playerRef.current && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        setIsPlaying(false);
      }
    }, 200);
  }, [videoId]);

  // 3) Listen for remote video changes and load accordingly
  useEffect(() => {
    console.log('[SyncAudio] Setting up video-changed listener for room:', roomId);
    const onChange = (newVideoId: string) => {
      console.log('🔄 Received video-changed →', newVideoId);
      console.log('[SyncAudio] Current videoId prop:', videoId);
      console.log('[SyncAudio] Loading new video:', newVideoId);
      playerRef.current?.loadVideoById(newVideoId);
      // Reset time states
      setCurrentTime(0);
      setDuration(0);
    };
    socket.on('video-changed', onChange);
    console.log('[SyncAudio] video-changed listener added');
    return () => {
      console.log('[SyncAudio] Removing video-changed listener');
      socket.off('video-changed', onChange);
    };
  }, [socket, roomId]);

  // 4) Sync play/pause commands
  useEffect(() => {
    const onSync = ({ cmd, timestamp, seekTime }: { cmd: string; timestamp: number; seekTime: number }) => {
      const execAt = timestamp + offset;
      const delay = Math.max(execAt - Date.now(), 0);
      console.log(`🔄 Scheduling ${cmd} in ${delay}ms`);
      setTimeout(() => {
        const p = playerRef.current;
        if (!p) return;
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
        const time = player.getCurrentTime();
        const dur = player.getDuration();
        if (time > 0) setCurrentTime(time);
        if (dur > 0) setDuration(dur);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSeeking]);

  // Handle seek bar change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const player = playerRef.current;
    if (!player || !isHost) return;
    
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setIsSeeking(true);
  };

  // Handle seek bar mouse up (when user finishes seeking)
  const handleSeekEnd = () => {
    const player = playerRef.current;
    if (!player || !isHost) return;
    
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

      {/* Host controls */}
      {isHost && (
        <div className="mt-4 space-y-4">
          {/* Play controls */}
          <div className="flex justify-center items-center gap-6">
            <button
              className="flex items-center cursor-pointer justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
              onClick={onPlayPrev}
              aria-label="Previous"
              type="button"
            >
              <SkipBack size={36} />
            </button>
            {!isPlaying && (
              <button
                className="flex items-center cursor-pointer justify-center w-20 h-20 rounded-full bg-gradient-to-r from-red-200 to-white text-red-600 hover:from-red-300 hover:to-white focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors shadow-lg relative"
                onClick={() => {
                  const p = playerRef.current;
                  if (!p || !videoId) return console.error('Player not ready or no video');
                  p.playVideo();
                  sendCommand('play', p.getCurrentTime(), Date.now() + BUFFER);
                  setIsPlaying(true);
                }}
                aria-label="Play"
                type="button"
                disabled={isLoading || !videoId}
              >
                {isLoading ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                className="flex items-center cursor-pointer justify-center w-20 h-20 rounded-full bg-gradient-to-r from-red-200 to-white text-red-600 hover:from-red-300 hover:to-white focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors shadow-lg relative"
                onClick={() => {
                  const p = playerRef.current;
                  if (!p) return console.error('Player not ready');
                  p.pauseVideo();
                  sendCommand('pause', p.getCurrentTime(), Date.now() + BUFFER);
                  setIsPlaying(false);
                }}
                aria-label="Pause"
                type="button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              className="flex items-center cursor-pointer justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
              onClick={onPlayNext}
              aria-label="Next"
              type="button"
            >
              <SkipForward size={36} />
            </button>
          </div>

          {/* Timer and Seek Bar */}
          <div className="w-full">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-mono text-red-500 min-w-[30px]">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative min-w-0">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  className="w-full h-3 bg-red-100/40 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #f87171 0%, #f87171 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.5) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.5) 100%)`
                  }}
                />
              </div>
              <span className="text-xs font-mono text-red-500 min-w-[30px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Non-host view (read-only timer) */}
      {!isHost && (
        <div className="mt-4 w-full">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-mono text-red-500 min-w-[30px]">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative min-w-0">
              <div 
                className="w-full h-3 bg-red-100/40 rounded-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(to right, #f87171 0%, #f87171 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.5) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.5) 100%)`
                }}
              />
            </div>
            <span className="text-xs font-mono text-red-500 min-w-[30px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f87171;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f87171;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.3);
        }
      `}</style>
    </>
  );
}
