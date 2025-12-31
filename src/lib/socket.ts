// lib/socket.ts
'use client';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Get the current socket instance (may be null if not connected)
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Connect to the WebSocket server and return the socket instance.
 * If already connected, returns the existing socket.
 */
export function connectSocket(): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  // Use environment variable for production, fallback to localhost for development
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  socket = io(socketUrl, {
    path: '/api/socket',
    transports: ['websocket'],
  });

  // Add connection event listeners for debugging
  socket.on('connect', () => {
    console.log('[Socket] Connected successfully, ID:', socket?.id);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
}

/**
 * Disconnect from the WebSocket server and clean up the socket instance.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket] Disconnected and cleaned up');
  }
}

/**
 * Check if the socket is currently connected.
 */
export function isSocketConnected(): boolean {
  return socket !== null && socket.connected;
}
