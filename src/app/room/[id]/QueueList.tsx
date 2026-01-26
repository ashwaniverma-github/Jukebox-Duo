// app/room/[id]/QueueList.tsx
'use client'
import { useState } from 'react'
import { getSocket } from '../../../lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircleIcon, TrashIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail?: string;
  order: number;
}

interface Props {
  roomId: string;
  queue: QueueItem[];
  onSelect: (videoId: string) => void;
  currentVideoId?: string;
  onRemove?: (itemId: string) => void;
  removingQueueItemId?: string | null;
  setRemovingQueueItemId?: (id: string | null) => void;
  theme?: 'default' | 'love';
  isLoading?: boolean;
}

export default function QueueList({ roomId, queue, onSelect, currentVideoId, onRemove, removingQueueItemId, setRemovingQueueItemId, theme = 'default', isLoading = false }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Theme configuration for QueueList
  const themeStyles = {
    default: {
      emptyIcon: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-900/30",
      emptyIconText: "text-red-400",
      activeBg: "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/20",
      activeBorder: "border-red-200 dark:border-red-700",
      numberActive: "bg-gradient-to-r from-red-700 to-red-500",
      playingBadge: "from-red-700 to-red-500",
      thumbnailOverlay: "from-red-700/20 to-red-500/20",
      playIcon: "text-red-600",
      playingText: "text-red-600 dark:text-red-400",
      playButton: "from-red-700 to-red-500 ring-red-500",
      removeButton: "bg-red-500 hover:bg-red-600 ring-red-500",
      hoverOverlay: "from-red-700/5 to-red-500/5"
    },
    love: {
      emptyIcon: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-900/30",
      emptyIconText: "text-pink-400",
      activeBg: "bg-gradient-to-r from-pink-500/10 to-rose-500/10 dark:from-pink-900/20 dark:to-rose-900/20",
      activeBorder: "border-pink-500/30 dark:border-pink-500/30",
      numberActive: "bg-gradient-to-r from-pink-500 to-rose-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]",
      playingBadge: "from-pink-500 to-rose-500 shadow-md",
      thumbnailOverlay: "from-pink-600/30 to-rose-500/30",
      playIcon: "text-pink-600",
      playingText: "text-pink-400 dark:text-pink-300",
      playButton: "from-pink-500 to-rose-500 ring-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]",
      removeButton: "bg-pink-500 hover:bg-pink-600 ring-pink-500",
      hoverOverlay: "from-pink-500/10 to-rose-500/10"
    }
  };

  const currentTheme = themeStyles[theme];

  const handlePlay = async (item: QueueItem) => {
    console.log('[QueueList] handlePlay called for item:', item);
    const itemIndex = queue.findIndex(q => q.id === item.id)
    if (itemIndex !== -1) {
      setCurrentIndex(itemIndex)
      console.log('[QueueList] Calling onSelect with id:', item.id);
      onSelect(item.id)
      await fetch(`/api/rooms/${roomId}/queue`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentIndex: itemIndex })
      })
    }
  }

  const handleRemove = async (itemId: string) => {
    if (setRemovingQueueItemId) setRemovingQueueItemId(itemId);

    try {
      const response = await fetch(`/api/rooms/${roomId}/queue?itemId=${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Queue item deleted:', result)

        // Emit queue-removed event to sync with other clients (if socket connected)
        const socket = getSocket();
        if (socket) {
          socket.emit('queue-removed', {
            roomId,
            itemId,
            deletedOrder: result.deletedOrder,
            newCurrentIndex: result.newCurrentIndex
          });
        }

        // Call the parent's onRemove callback which will refresh the queue
        if (onRemove) onRemove(itemId);

        // Update local state based on server response
        const removedIndex = queue.findIndex(item => item.id === itemId)
        if (removedIndex <= currentIndex && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1)
        }
      } else {
        console.error('Failed to delete queue item:', await response.text())
      }
    } catch (error) {
      console.error('Error deleting queue item:', error)
    }
  }

  return (
    <div className="h-full flex flex-col">

      {/* Queue Content */}
      {isLoading ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`w-16 h-16 mx-auto mb-4 border-4 border-t-transparent rounded-full animate-spin ${theme === 'love' ? 'border-pink-500' : 'border-red-500'}`}></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading queue...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please wait</p>
        </motion.div>
      ) : queue.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${currentTheme.emptyIcon} flex items-center justify-center`}>
            <QueueListIcon className={`w-8 h-8 ${currentTheme.emptyIconText}`} />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Queue is empty</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add videos to get started</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {queue.map((item, idx) => {
              const isCurrentVideo = item.videoId === currentVideoId;
              const isRemoving = removingQueueItemId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                    layout: { duration: 0.3 }
                  }}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${isCurrentVideo
                    ? `${currentTheme.activeBg} border-2 ${currentTheme.activeBorder} shadow-lg scale-[1.02]`
                    : 'bg-white/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/70 hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                  {/* Queue Number Indicator */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrentVideo
                      ? `${currentTheme.numberActive} text-white shadow-lg`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Now Playing Indicator */}
                  {isCurrentVideo && (
                    <div className="absolute top-3 right-2  z-10">
                      <div className={`flex items-center space-x-1 bg-gradient-to-r ${currentTheme.playingBadge} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                        <PlayIcon className="w-3 h-3 animate-pulse" />
                        <span>Now Playing</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center p-4 space-x-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.thumbnail}
                        width={80}
                        height={60}
                        alt={item.title}
                        className="rounded-xl shadow-md object-cover w-20 h-15 group-hover:scale-105 transition-transform duration-300"
                      />
                      {isCurrentVideo && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.thumbnailOverlay} rounded-xl flex items-center justify-center`}>
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                            <PlayIcon className={`w-4 h-4 ${currentTheme.playIcon}`} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight mb-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>#{idx + 1} in queue</span>
                        {isCurrentVideo && (
                          <>
                            <span>•</span>
                            <span className={`${currentTheme.playingText} font-medium animate-pulse`}>
                              Playing now
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center cursor-pointer mt-6 justify-center w-10 h-10 bg-gradient-to-r ${currentTheme.playButton} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        onClick={() => handlePlay(item)}
                        disabled={isRemoving}
                        title="Play now"
                      >
                        <PlayCircleIcon className="w-5 h-5" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center cursor-pointer mt-6 justify-center w-10 h-10 ${currentTheme.removeButton} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        onClick={() => handleRemove(item.id)}
                        disabled={isRemoving}
                        title="Remove from queue"
                      >
                        {isRemoving ? (
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : (
                          <TrashIcon className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.hoverOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}


    </div>
  )
}