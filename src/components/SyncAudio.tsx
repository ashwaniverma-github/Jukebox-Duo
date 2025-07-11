// components/SyncAudio.tsx
'use client';

import { useRef, useEffect } from 'react';
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
}

const BUFFER = 1000; // ms buffer for scheduling

export default function SyncAudio({ roomId, videoId, isHost, onPlayNext }: Props) {
  const playerRef = useRef<YT.Player | null>(null);
  const socket = getSocket();
  const { offset, sendCommand } = useSyncPlayer(roomId);

  // 1) Initialize YouTube IFrame API once
  useEffect(() => {
    console.log('🔧 Registering onYouTubeIframeAPIReady');
    window.onYouTubeIframeAPIReady = () => {
      console.log('▶️ onYouTubeIframeAPIReady fired');
      playerRef.current = new window.YT.Player('audio-player', {
        videoId,
        playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: (e) => {
            console.log('🛠️ YouTube Player Ready');
            if (!isHost) {
              // unlock autoplay
              e.target.mute();
              e.target.playVideo();
              e.target.pauseVideo();
              e.target.unMute();
              console.log('🔓 Autoplay unlocked for listener');
            }
          },
          onStateChange: (e) => {
            console.log('📺 StateChange:', e.data);
            // 0 === ENDED
            if (isHost && typeof window.YT !== 'undefined' && e.data === window.YT.PlayerState.ENDED) {
              if (onPlayNext) onPlayNext();
            }
          },
        },
      });
      console.log('✅ Player instance created');
    };
  }, []); // run only once

  // 2) React to local videoId prop changes (host only)
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.loadVideoById !== 'function') return;
    console.log('🔄 videoId prop changed:', videoId);
    playerRef.current.loadVideoById(videoId);
  }, [videoId]);

  // 3) Listen for remote video changes and load accordingly
  useEffect(() => {
    const onChange = ({ roomId: rid, videoId: newId }: { roomId: string; videoId: string }) => {
      if (rid !== roomId) return;
      console.log('🔄 Received change-video →', newId);
      playerRef.current?.loadVideoById(newId);
    };
    socket.on('change-video', onChange);
    return () => void socket.off('change-video', onChange);
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

      {/* Test play for everyone */}
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => {
            if (!playerRef.current) return console.error('Player not ready');
            console.log('🧪 Test Play clicked');
            playerRef.current.playVideo();
          }}
        >
          Test Play
        </button>
      </div>

      {/* Host controls */}
      {isHost && (
        <div className="mt-4 space-x-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              const p = playerRef.current;
              if (!p) return console.error('Player not ready');
              const seek = p.getCurrentTime();
              const ts = Date.now() + BUFFER;
              console.log('▶️ Host scheduling PLAY');
              setTimeout(() => {
                p.seekTo(seek, true);
                p.playVideo();
              }, BUFFER);
              sendCommand('play', seek, ts);
            }}
          >
            Play
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={() => {
              const p = playerRef.current;
              if (!p) return console.error('Player not ready');
              const seek = p.getCurrentTime();
              const ts = Date.now() + BUFFER;
              console.log('⏸️ Host scheduling PAUSE');
              setTimeout(() => {
                p.seekTo(seek, true);
                p.pauseVideo();
              }, BUFFER);
              sendCommand('pause', seek, ts);
            }}
          >
            Pause
          </button>
        </div>
      )}
    </>
  );
}
