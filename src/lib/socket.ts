// lib/socket.ts
'use client';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export function getSocket(): Socket {
  if (!socket) {
    // Use environment variable for production, fallback to localhost for development
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    socket = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket'],
    });
   
    // Add connection event listeners for debugging
    socket.on('connect', () => {
      console.log('[Socket] Connected successfully, ID:', socket.id);
    });
   
    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });
   
    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });
  }
  return socket;
}
