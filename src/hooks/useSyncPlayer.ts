// hooks/useSyncPlayer.ts
'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';

export function useSyncPlayer(roomId: string) {
  const [offset, setOffset] = useState(0);

  // join the room & clock sync
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const t0 = Date.now();
    socket.emit('sync-ping', t0);

    const handlePong = (serverTs: number) => {
      const t2 = Date.now();
      setOffset(((t0 + t2) / 2) - serverTs);
    };

    socket.on('sync-pong', handlePong);

    return () => {
      socket.off('sync-pong', handlePong);
    };
  }, [roomId]);

  // send a play/pause to the room
  function sendCommand(
    cmd: 'play' | 'pause',
    seekTime: number,
    timestamp: number
  ) {
    const socket = getSocket();
    if (socket) {
      socket.emit('sync-command', { roomId, cmd, timestamp, seekTime });
    }
  }

  return { offset, sendCommand };
}
