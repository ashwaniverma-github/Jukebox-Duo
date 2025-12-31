'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Props { roomId: string }

/**
 * JoinRoom component - handles DB membership persistence only.
 * WebSocket connection is now handled by the parent page.tsx based on sync state.
 */
export default function JoinRoom({ roomId }: Props) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Persist membership to DB - only on first visit per session
    // This avoids unnecessary DB calls on every mount/re-render
    const joinKey = `room_joined_${roomId}_${session.user.id}`;
    const alreadyJoined = sessionStorage.getItem(joinKey);

    if (!alreadyJoined) {
      fetch(`/api/rooms/${roomId}/join`, { method: 'POST' })
        .then(() => {
          sessionStorage.setItem(joinKey, Date.now().toString());
        })
        .catch(console.error);
    }

    // Note: WebSocket presence and leave events are now handled by page.tsx
    // when sync is enabled. This component only handles DB membership.
  }, [roomId, session?.user?.id]);

  return null;  // this component renders nothing
}
