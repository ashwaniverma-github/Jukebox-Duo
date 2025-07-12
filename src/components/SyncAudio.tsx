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

declare namespace YT {
  class Player {
    constructor(elementId: string, options: any);
    loadVideoById(videoId: string): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    playVideo(): void;
    pauseVideo(): void;
    mute(): void;
    unMute(): void;
    getCurrentTime(): number;
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

export default function SyncAudio({ roomId, videoId, isHost, onPlayNext, onPlayPrev }: Props) {
  const playerRef = useRef<YT.Player | null>(null);
  const socket = getSocket();
  const { offset, sendCommand } = useSyncPlayer(roomId);
  const [isPlaying, setIsPlaying] = useState(false);

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
          onReady: (e) => {
            console.log('🛠️ YouTube Player Ready');
            // Remove autoplay unlock for listeners; do not play or pause automatically
          },
          onStateChange: (e) => {
            console.log('📺 StateChange:', e.data);
            if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            else if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) setIsPlaying(false);
          },
        },
      });
      console.log('✅ Player instance created');
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
    const onSync = ({ cmd, timestamp, seekTime }: any) => {
      const execAt = timestamp + offset;
      const delay = Math.max(execAt - Date.now(), 0);
      console.log(`🔄 Scheduling ${cmd} in ${delay}ms`);
      setTimeout(() => {
        const p = playerRef.current;
        if (!p) return;
        p.seekTo(seekTime, true);
        cmd === 'play' ? p.playVideo() : p.pauseVideo();
      }, delay);
    };
    socket.on('sync-command', onSync);
    return () => void socket.off('sync-command', onSync);
  }, [socket, offset]);

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
        <div className="mt-4 flex justify-center items-center gap-6">
          <button
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 text-blue-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            onClick={onPlayPrev}
            aria-label="Previous"
            type="button"
          >
            <SkipBack size={36} />
          </button>
          {!isPlaying && (
            <button
              className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              onClick={() => {
                const p = playerRef.current;
                if (!p) return console.error('Player not ready');
                p.playVideo();
                sendCommand('play', p.getCurrentTime(), Date.now() + BUFFER);
                setIsPlaying(true);
              }}
              aria-label="Play"
              type="button"
            >
              <CirclePlay size={60} />
            </button>
          )}
          {isPlaying && (
            <button
              className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              onClick={() => {
                const p = playerRef.current;
                if (!p) return console.error('Player not ready');
                p.pauseVideo();
                sendCommand('pause', p.getCurrentTime(), Date.now() + BUFFER);
                setIsPlaying(false);
              }}
              aria-label="Pause"
              type="button"
            >
              <CirclePause size={60} />
            </button>
          )}
          <button
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 text-blue-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            onClick={onPlayNext}
            aria-label="Next"
            type="button"
          >
            <SkipForward size={36} />
          </button>
        </div>
      )}
    </>
  );
}
