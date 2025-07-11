'use client'

import { useEffect } from 'react'
import { getSocket } from '../../../lib/socket'

interface Props { roomId: string }

export default function JoinRoom({ roomId }: Props) {
  useEffect(() => {
    // 1) Persist to your DB
    fetch(`/api/rooms/${roomId}/join`, { method: 'POST' })
      .catch(console.error)

    // 2) Join the Socket.IO room
    const socket = getSocket()
    socket.emit('join-room', roomId)

    // Cleanup isn’t strictly necessary here
    return () => {
      // optionally: socket.emit('leave-room', roomId)
    }
  }, [roomId])

  return null  // this component renders nothing
}
