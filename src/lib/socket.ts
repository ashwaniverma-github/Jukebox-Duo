// lib/socket.ts
'use client';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('http://localhost:3001', {
      path: '/api/socket',
      transports: ['websocket'],
    });
  }
  return socket;
}
