'use client'

import { useEffect } from 'react'
import { getSocket } from '../../../lib/socket'
import { useSession } from 'next-auth/react'

interface Props { roomId: string }

export default function JoinRoom({ roomId }: Props) {
  const { data: session } = useSession();

  useEffect(() => {
    // 1) Persist to your DB
    fetch(`/api/rooms/${roomId}/join`, { method: 'POST' })
      .catch(console.error)

    // 2) Join the Socket.IO room
    const socket = getSocket()
    socket.emit('join-room', roomId)
    if (session?.user?.id) {
      socket.emit('presence-join', {
        roomId,
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
        }
      })
    }

    // Cleanup isn’t strictly necessary here
    return () => {
      const userId = session?.user?.id;
      if (userId) {
        try {
          socket.emit('leave-room', { roomId, userId })
        } catch {}
      }
    }
  }, [roomId, session?.user?.id, session?.user?.name, session?.user?.image])

  return null  // this component renders nothing
}
