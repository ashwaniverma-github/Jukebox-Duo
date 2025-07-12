// hooks/useSyncPlayer.ts
'use client';

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../lib/socket';

export function useSyncPlayer(roomId: string) {
  const socket: Socket = getSocket();
  const [offset, setOffset] = useState(0);

  // join the room & clock sync
  useEffect(() => {
    const t0 = Date.now();
    socket.emit('sync-ping', t0);
    socket.on('sync-pong', (serverTs: number) => {
      const t2 = Date.now();
      setOffset(((t0 + t2) / 2) - serverTs);
    });

    return () => {
      socket.off('sync-pong');
      socket.off('sync-command');
    };
  }, [roomId]);

  // send a play/pause to the room
  function sendCommand(
    cmd: 'play' | 'pause',
    seekTime: number,
    timestamp: number
  ) {
    socket.emit('sync-command', { roomId, cmd, timestamp, seekTime });
  }

  return { offset, sendCommand };
}
