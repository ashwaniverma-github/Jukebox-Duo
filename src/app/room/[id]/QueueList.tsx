// app/room/[id]/QueueList.tsx
'use client'
import { useState, useEffect } from 'react'
import { getSocket } from '../../../lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircleIcon, TrashIcon, ForwardIcon } from '@heroicons/react/24/outline';

interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  order: number;
}

interface Props {
  roomId: string;
  onSelect: (videoId: string) => void;
  currentVideoId?: string;
}

export default function QueueList({ roomId, onSelect, currentVideoId }: Props) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch(`/api/rooms/${roomId}/queue`)
      .then(r => r.json())
      .then(setQueue)

    const socket = getSocket()
    socket.emit('join-room', roomId)
    const handler = (item: QueueItem) => setQueue((qs) => [...qs, item])
    socket.on('queue-updated', handler)
    return () => void socket.off('queue-updated', handler)
  }, [roomId])

  const handlePlay = async (item: QueueItem) => {
    const itemIndex = queue.findIndex(q => q.id === item.id)
    if (itemIndex !== -1) {
      setCurrentIndex(itemIndex)
      onSelect(item.videoId)
      await fetch(`/api/rooms/${roomId}/queue`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentIndex: itemIndex })
      })
    }
  }

  const handlePlayNext = () => {
    const nextIndex = (currentIndex + 1) % queue.length
    if (queue[nextIndex]) {
      setCurrentIndex(nextIndex)
      onSelect(queue[nextIndex].videoId)
      fetch(`/api/rooms/${roomId}/queue`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentIndex: nextIndex })
      })
    }
  }

  const handleRemove = async (itemId: string) => {
    await fetch(`/api/rooms/${roomId}/queue?itemId=${itemId}`, {
      method: 'DELETE'
    })
    setQueue(prev => prev.filter(item => item.id !== itemId))
    const removedIndex = queue.findIndex(item => item.id === itemId)
    if (removedIndex <= currentIndex && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <motion.div
      className="rounded-2xl bg-white/70 dark:bg-black/70 shadow-lg p-4 backdrop-blur-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold tracking-tight">Queue</h3>
        <button
          className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm shadow hover:scale-105 transition-transform"
          onClick={handlePlayNext}
          disabled={queue.length === 0}
        >
          <ForwardIcon className="w-4 h-4" /> Play Next
        </button>
      </div>
      {queue.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Queue is empty</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {queue.map((item, idx) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`flex items-center justify-between p-2 border rounded-xl shadow-sm transition-all ${item.videoId === currentVideoId ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/80 border-pink-300 dark:from-purple-900/40 dark:to-pink-900/40 dark:border-pink-700 scale-[1.03]' : 'bg-white/60 dark:bg-black/40 border-gray-200 dark:border-gray-700'}`}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <img src={item.thumbnail} width={48} height={36} alt="" className="rounded shadow" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{item.title}</span>
                    {item.videoId === currentVideoId && (
                      <span className="text-xs text-pink-600 font-semibold animate-pulse">Now Playing</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs shadow hover:scale-110 transition-transform"
                    onClick={() => handlePlay(item)}
                  >
                    <PlayCircleIcon className="w-4 h-4" /> Play
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-lg text-xs shadow hover:scale-110 transition-transform"
                    onClick={() => handleRemove(item.id)}
                  >
                    <TrashIcon className="w-4 h-4" /> Remove
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  )
}
