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
import { Dialog, DialogTrigger, DialogContent } from '../../../components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '../../../components/ui/sheet';
import { Toast } from '../../../components/ui/toast';
import { Search } from 'lucide-react'

export default function RoomPage() {
  const { id: roomId } = useParams() as { id: string };
  const [videoId, setVideoId] = useState('');
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean, title: string, description?: string }>({ open: false, title: '' });

  // Fetch queue and set current song
  useEffect(() => {
    fetch(`/api/rooms/${roomId}/queue`)
      .then(r => r.json())
      .then((queueData) => {
        setQueue(queueData);
        if (queueData.length > 0) {
          setVideoId(queueData[0].videoId);
          setCurrentSong(queueData[0]);
        }
      });
    // Log joining room
    const socket = getSocket();
    console.log('[Socket] Socket connected:', socket.connected);
    console.log('[Socket] Socket ID:', socket.id);
   
    // Check if socket connects after a delay
    const checkConnection = () => {
      console.log('[Socket] Connection status after delay:', socket.connected);
      console.log('[Socket] Socket ID after delay:', socket.id);
    };
    setTimeout(checkConnection, 2000);
    
    socket.emit('join-room', roomId);
    console.log('[Socket] join-room', roomId);
  }, [roomId]);

  // When videoId changes, update currentSong
  useEffect(() => {
    if (!videoId) return;
    const song = queue.find((item) => item.videoId === videoId);
    if (song) setCurrentSong(song);
    console.log('[RoomPage] videoId changed:', videoId);
  }, [videoId, queue]);

  // Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    try {
      const res = await fetch(`/api/rooms/${roomId}/search?q=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      setSearchError('Failed to search. Try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Add to queue handler (optimistic update + toast)
  const handleAddToQueue = async (item: any) => {
    // Optimistically update queue
    setQueue(prev => [...prev, {
      id: Math.random().toString(36).slice(2), // temp id
      videoId: item.videoId,
      title: item.title,
      thumbnail: item.thumbnail,
      order: prev.length
    }]);
    setToast({ open: true, title: 'Song added to queue!', description: item.title });
    await fetch(`/api/rooms/${roomId}/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: item.videoId,
        title: item.title,
        thumbnail: item.thumbnail
      })
    });
    // Refresh queue from server
    fetch(`/api/rooms/${roomId}/queue`)
      .then(r => r.json())
      .then((queueData) => {
        setQueue(queueData);
        if (!videoId && queueData.length > 0) {
          setVideoId(queueData[0].videoId);
        }
      });
  };

  // Play next song handler
  const handlePlayNext = () => {
    if (!videoId || queue.length === 0) return;
    const currentIdx = queue.findIndex(item => item.videoId === videoId);
    if (currentIdx !== -1 && currentIdx < queue.length - 1) {
      const nextVideoId = queue[currentIdx + 1].videoId;
      setVideoId(nextVideoId);
      console.log('[Socket] emitting change-video (next)', { roomId, newVideoId: nextVideoId });
      getSocket().emit('change-video', { roomId, newVideoId: nextVideoId });
    }
  };

  // Play previous song handler
  const handlePlayPrev = () => {
    if (!videoId || queue.length === 0) return;
    const currentIdx = queue.findIndex(item => item.videoId === videoId);
    if (currentIdx > 0) {
      const prevVideoId = queue[currentIdx - 1].videoId;
      setVideoId(prevVideoId);
      console.log('[Socket] emitting change-video (prev)', { roomId, newVideoId: prevVideoId });
      getSocket().emit('change-video', { roomId, newVideoId: prevVideoId });
    }
  };

  // Listen for video-changed event from socket
  useEffect(() => {
    const socket = getSocket();
    console.log('[Socket] Setting up video-changed listener for room:', roomId);
    const handler = (newVideoId: string) => {
      console.log('[Socket] received video-changed', newVideoId);
      console.log('[Socket] Current videoId before change:', videoId);
      setVideoId(newVideoId);
      console.log('[Socket] setVideoId called with:', newVideoId);
    };
    socket.on('video-changed', handler);
    console.log('[Socket] video-changed listener added');
    return () => {
      console.log('[Socket] Removing video-changed listener');
      socket.off('video-changed', handler);
    };
  }, [roomId]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2d145e] via-[#4b206b] to-[#2d145e] flex flex-col items-center py-8 px-2">
      {/* Toast notification */}
      <Toast open={toast.open} onOpenChange={open => setToast(t => ({ ...t, open }))} title={toast.title} description={toast.description} />
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="inline-block bg-purple-600 rounded-full p-2 mr-2">
              <svg width="24" height="24" fill="none"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.15"/><path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
            Midnight Vibes
          </h1>
          <div className="text-sm text-purple-200">Hosted by Alex • 6 online</div>
        </div>

      </div>

      {/* Search & Add Music */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Card className="w-full max-w-5xl mb-6 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center gap-4 py-8">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-4">
                <Search/>
              </div>
              <div>
                <div className="text-xl font-bold text-white">Search & Add Music</div>
                <div className="text-sm text-purple-200">Discover new tracks and add them to the queue</div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl w-full">
          <div className="text-lg font-bold mb-2">Search Music Library</div>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 rounded-lg px-4 py-2 bg-[#1a1333] text-white placeholder-purple-300 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search for songs, artists, or albums..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <Button type="submit" disabled={searchLoading} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-6 py-2 rounded-lg">
              {searchLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
          {searchError && <div className="text-red-400 mb-2">{searchError}</div>}
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length === 0 && !searchLoading && <div className="text-purple-200 text-center py-8">No results yet. Try searching for a song!</div>}
            {searchResults.map((item, idx) => (
              <div key={item.videoId} className="flex items-center gap-4 bg-[#1a1333] rounded-lg p-3 mb-2">
                <img src={item.thumbnail} alt={item.title} className="w-14 h-14 rounded shadow" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{item.title}</div>
                  {/* You can add artist/album info here if available */}
                </div>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-4 py-2 rounded-lg"
                  onClick={() => handleAddToQueue(item)}
                >
                  + Add
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Main content grid */}
      <div className="grid grid-cols-1 w-full px-38">
        {/* Player and Up Next */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Player area */}
          <Card className="mb-2 relative overflow-hidden w-full col-span-full">
            {/* Blurred background image */}
            {currentSong?.thumbnail && (
              <img
                src={currentSong.thumbnail}
                alt="bg"
                className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 opacity-40 z-0"
                draggable={false}
              />
            )}
            <CardContent className="p-0 relative z-10">
              <div className="w-f h-56 flex items-center justify-center">
                {videoId ? (
                  <>
                    <SyncAudio
                      roomId={roomId}
                      videoId={videoId}
                      isHost={true} // TODO: set to true if current user is host, otherwise false
                      onPlayNext={handlePlayNext}
                      onPlayPrev={handlePlayPrev}
                    />
                  </>
                ) : (
                  <span className="text-white text-xl font-bold">No song playing</span>
                )}
              </div>
              {currentSong && (
                <div className="absolute left-6 bottom-6 bg-black/60 rounded-lg px-4 py-2 text-white">
                  <div className="font-bold text-lg">{currentSong.title}</div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Up Next / Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Up Next ({queue.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <QueueList roomId={roomId} onSelect={(id) => {
                setVideoId(id);
                console.log('[Socket] emitting change-video', { roomId, newVideoId: id });
                getSocket().emit('change-video', { roomId, newVideoId: id });
              }} currentVideoId={videoId} />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
