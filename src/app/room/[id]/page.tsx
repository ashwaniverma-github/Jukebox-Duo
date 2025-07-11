// app/room/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import JoinRoom from './JoinRoom'
import SyncAudio from '../../../components/SyncAudio'
import SearchBar from './SearchBar'
import { getSocket } from '../../../lib/socket'
import QueueList from './QueueList'
import { motion, AnimatePresence } from 'framer-motion';
import { UserGroupIcon, ShareIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '../../../components/ui/sheet';
import { Toast } from '../../../components/ui/toast';

export default function RoomPage() {
  const { id: roomId } = useParams() as { id: string }
  const socket = getSocket()

  const [videoId, setVideoId] = useState('dQw4w9WgXcQ')
  const [queue, setQueue] = useState<any[]>([])
  const [roomName, setRoomName] = useState('');
  const [participants, setParticipants] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const isHost = true // or derive from session
  const [toast, setToast] = useState<{ open: boolean, title: string, description?: string, variant?: 'default' | 'destructive' }>({ open: false, title: '' });

  useEffect(() => {
    socket.emit('join-room', roomId)
    // Fetch room info
    fetch(`/api/rooms/${roomId}`)
      .then(r => r.json())
      .then(data => {
        setRoomName(data.name || 'Room');
        setParticipants(data.participantCount || 1);
      });
  }, [roomId, socket])

  useEffect(() => {
    fetch(`/api/rooms/${roomId}/queue`)
      .then(r => r.json())
      .then((queueData) => {
        setQueue(queueData)
        if (queueData.length > 0) {
          setVideoId(queueData[0].videoId)
        }
      })
  }, [roomId])

  function handleSelect(id: string) {
    setVideoId(id)
    socket.emit('change-video', { roomId, videoId: id })
  }

  function handleQueueUpdate() {
    fetch(`/api/rooms/${roomId}/queue`)
      .then(r => r.json())
      .then(setQueue)
  }

  function handlePlayNext() {
    if (!queue.length) return;
    const currentIdx = queue.findIndex(item => item.videoId === videoId);
    const nextIdx = (currentIdx + 1) % queue.length;
    const next = queue[nextIdx];
    if (next) handleSelect(next.videoId);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setToast({ open: true, title: 'Link copied!', description: 'Share this room with friends.' });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:grid lg:grid-cols-4 gap-0 lg:gap-6">
      {/* Room Header */}
      <Card className="col-span-4 flex flex-row items-center justify-between px-4 py-3 bg-white/60 dark:bg-black/60 backdrop-blur-lg shadow-md rounded-b-xl sticky top-0 z-20 border-none">
        <CardHeader className="flex flex-row items-center gap-3 p-0">
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow">{roomName}</CardTitle>
          <span className="flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900 dark:to-pink-900 dark:text-pink-200">
            <UserGroupIcon className="w-4 h-4" /> {participants} joined
          </span>
        </CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleCopyLink}>
            <ShareIcon className="w-4 h-4" /> Share
          </Button>
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span className="sr-only">Open sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SearchBar roomId={roomId} onAdd={handleQueueUpdate} />
                <QueueList roomId={roomId} onSelect={handleSelect} currentVideoId={videoId} />
                <SheetClose asChild>
                  <Button variant="outline" className="mt-4 w-full">Close</Button>
                </SheetClose>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Card>

      {/* Sidebar (desktop only) */}
      <div className="hidden lg:flex flex-col gap-6 p-4">
        <SearchBar roomId={roomId} onAdd={handleQueueUpdate} />
        <QueueList roomId={roomId} onSelect={handleSelect} currentVideoId={videoId} />
      </div>

      {/* Main Content */}
      <main className="col-span-3 flex flex-col items-center justify-center p-4 lg:p-8">
        <JoinRoom roomId={roomId} />
        <Card className="w-full max-w-3xl bg-white/80 dark:bg-black/80 rounded-2xl shadow-xl p-6 flex flex-col gap-6 backdrop-blur-lg border-none">
          <SyncAudio roomId={roomId} videoId={videoId} isHost={isHost} onPlayNext={handlePlayNext} />
        </Card>
      </main>

      {/* Toast for feedback */}
      <Toast
        open={toast.open}
        onOpenChange={open => setToast(t => ({ ...t, open }))}
        title={toast.title}
        description={toast.description}
        variant={toast.variant}
      />
    </div>
  )
}
