// app/room/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import SyncAudio from '../../../components/SyncAudio'
import { getSocket } from '../../../lib/socket'
import QueueList from './QueueList'
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogTrigger, DialogContent } from '../../../components/ui/dialog';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Search, Users, Music, X, Share2 } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function RoomPage() {
  const { id: roomId } = useParams() as { id: string };
  const { data: session, status } = useSession();
  const router = useRouter();

  // All hooks must be called unconditionally
  const [videoId, setVideoId] = useState('');
  const [currentSong, setCurrentSong] = useState<{ videoId: string; title: string; thumbnail?: string } | null>(null);
  const [queue, setQueue] = useState<{ id: string; videoId: string; title: string; thumbnail?: string; order: number }[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ videoId: string; title: string; thumbnail?: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isQueueCollapsed, setIsQueueCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [removingQueueItemId, setRemovingQueueItemId] = useState<string | null>(null);
  const [pendingAdds, setPendingAdds] = useState<Set<string>>(new Set());
  const [roomDetails, setRoomDetails] = useState<{ name?: string; host?: { name?: string; email?: string } } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : '';
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
      router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [status, router]);

  // Fetch queue and set current song
  useEffect(() => {
    if (status !== "authenticated") return;
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
    setTimeout(() => {
      // Check connection after a delay
      // (optional debug)
    }, 2000);
    socket.emit('join-room', roomId);
  }, [roomId, status]);

  // Fetch room details
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/rooms/${roomId}`)
      .then(r => r.json())
      .then((data) => {
        setRoomDetails(data);
      });
  }, [roomId, status]);

  // When videoId changes, update currentSong
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!videoId) return;
    const song = queue.find((item) => item.videoId === videoId);
    if (song) setCurrentSong(song);
  }, [videoId, queue, status]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (!searchTerm.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            setSearchError('');
            return;
          }
          setSearchLoading(true);
          setSearchError('');
          try {
            const res = await fetch(`/api/rooms/${roomId}/search?q=${encodeURIComponent(searchTerm)}`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            setSearchResults(data);
          } catch (err) {
            setSearchError('Failed to search. Try again.');
            console.error('Search failed:', err);
          } finally {
            setSearchLoading(false);
          }
        }, 300); // 300ms delay
      };
    })(),
    [roomId]
  );

  // Effect to trigger search when search term changes
  useEffect(() => {
    if (status !== "authenticated") return;
    if (search.trim()) {
      setSearchLoading(true);
    }
    debouncedSearch(search);
  }, [search, debouncedSearch, status]);

  // Add to queue handler (optimistic update + toast)
  const handleAddToQueue = async (item: { videoId: string; title: string; thumbnail?: string }) => {
    // Add to pending adds to prevent duplication
    setPendingAdds(prev => new Set(prev).add(item.videoId));
    
    // Optimistically update queue
    setQueue(prev => [...prev, {
      id: Math.random().toString(36).slice(2), // temp id
      videoId: item.videoId,
      title: item.title,
      thumbnail: item.thumbnail,
      order: prev.length
    }]);
    setModalOpen(false); // Close modal after adding
    
    try {
      await fetch(`/api/rooms/${roomId}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: item.videoId,
          title: item.title,
          thumbnail: item.thumbnail
        })
      });
      
      // Emit queue-updated event to sync with other clients
      console.log('[Socket] emitting queue-updated', { roomId, item });
      getSocket().emit('queue-updated', {
        roomId,
        item: {
          videoId: item.videoId,
          title: item.title,
          thumbnail: item.thumbnail
        }
      });
    } catch {
      console.error('Failed to add to queue');
      // Remove from pending adds if the request failed
      setPendingAdds(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.videoId);
        return newSet;
      });
    }
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

  // Listen for queue-updated event from socket
  useEffect(() => {
    const socket = getSocket();
    console.log('[Socket] Setting up queue-updated listener for room:', roomId);
    const handler = (item: { videoId: string; title: string; thumbnail?: string }) => {
      console.log('[Socket] received queue-updated', item);
      
      // Check if this item is already pending (to prevent duplication)
      if (pendingAdds.has(item.videoId)) {
        console.log('[Socket] Skipping duplicate item:', item.videoId);
        // Remove from pending adds since we've received the confirmation
        setPendingAdds(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.videoId);
          return newSet;
        });
        return;
      }
      
      setQueue(prev => [...prev, {
        id: Math.random().toString(36).slice(2), // temp id
        videoId: item.videoId,
        title: item.title,
        thumbnail: item.thumbnail,
        order: prev.length
      }]);
    };
    socket.on('queue-updated', handler);
    console.log('[Socket] queue-updated listener added');
    return () => {
      console.log('[Socket] Removing queue-updated listener');
      socket.off('queue-updated', handler);
    };
  }, [roomId, pendingAdds]);

  // Listen for queue-removed event from socket
  useEffect(() => {
    const socket = getSocket();
    console.log('[Socket] Setting up queue-removed listener for room:', roomId);
    const handler = (itemId: string) => {
      console.log('[Socket] received queue-removed', itemId);
      setQueue(prev => prev.filter(item => item.id !== itemId));
    };
    socket.on('queue-removed', handler);
    console.log('[Socket] queue-removed listener added');
    return () => {
      console.log('[Socket] Removing queue-removed listener');
      socket.off('queue-removed', handler);
    };
  }, [roomId]);

  // Optimistically remove a song from the queue
  const handleRemoveFromQueue = (itemId: string) => {
    setQueue(prev => prev.filter(item => item.id !== itemId));
    setRemovingQueueItemId(null);
  };

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-700/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-800/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full px-4 sm:px-6 py-4 sm:py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Room Info (dynamic) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{roomDetails?.name || 'Room'}</h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-red-200">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Hosted by {roomDetails?.host?.name || 'Unknown'}</span>
                </div>
              </div>
            </motion.div>
          </div>
          {/* Right: Invite Button + Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Invite Button */}
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2 rounded-full bg-white/10 hover:bg-red-700/30 text-white"
                  onClick={() => setInviteOpen(true)}
                  aria-label="Invite"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-6 h-6 text-red-400" />
                  <h2 className="text-lg font-bold">Invite to Room</h2>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 h-12 bg-white/10 border-white/20 text-white text-sm px-4 rounded-xl backdrop-blur-sm"
                  />
                  <Button
                    onClick={async () => {
                      await navigator.clipboard.writeText(shareLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="h-12 px-4 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="text-xs text-gray-400 mt-2">Share this link to invite others to your music room.</div>
              </DialogContent>
            </Dialog>
            {/* Profile Avatar + Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Profile'}
                  className="ml-4 w-10 h-10 rounded-full border-2 border-white/30 shadow-lg cursor-pointer object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="ml-4 w-10 h-10 rounded-full border-2 border-white/30 shadow-lg bg-white/10 flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:scale-105 transition-transform">
                  {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?'}
                </div>
              )}
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                align="end"
                className="z-50 min-w-[200px] rounded-xl bg-[#1a0d2e] border border-white/20 shadow-2xl p-2 text-white animate-fade-in"
              >
                <div className="flex flex-col items-center gap-2 px-2 py-3">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'Profile'}
                      className="w-12 h-12 rounded-full border-2 border-white/30 object-cover mb-1"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white font-bold text-xl mb-1">
                      {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-semibold text-base">{session?.user?.name || 'User'}</div>
                    <div className="text-xs text-red-200">{session?.user?.email || ''}</div>
                  </div>
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
                <DropdownMenu.Item
                  onSelect={() => { window.location.href = '/dashboard'; }}
                  className="w-full px-4 py-2 rounded-lg text-left hover:bg-red-700/30 transition-colors cursor-pointer font-medium"
                >
                  My Dashboard
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => signOut({ callbackUrl: '/' })}
                  className="w-full px-4 py-2 rounded-lg text-left hover:bg-white/20 transition-colors cursor-pointer font-medium"
                >
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-[#1a0d2e] to-[#2d145e] border-l border-white/20 p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-white">Room Menu</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 cursor-pointer" />
                </button>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    setModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Music
                </Button>
                
                <div className="text-sm text-red-200 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Room is live</span>
                  </div>
                  <div className="text-xs opacity-70">
                    Share room code: <span className="font-mono bg-white/10 px-2 py-1 rounded">{roomId}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="relative z-10 px-2 sm:px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Search Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 sm:mb-8"
          >
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white/10 backdrop-blur-md border-white/20 overflow-hidden group">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-700 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                          <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Search & Add Music</h3>
                        <p className="text-sm sm:text-base text-red-200 opacity-90">Discover new tracks and add them to the queue</p>
                      </div>
                      <div className="hidden sm:block">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <ChevronDownIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="w-full max-w-full sm:max-w-2xl mx-2 sm:mx-4 bg-[#1a0d2e] border-white/20 text-white p-2 sm:p-6 rounded-xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">Search Music Library</h2>
                      <p className="text-xs sm:text-sm text-red-200">Find and add songs to your queue</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full rounded-xl px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 bg-white/10 backdrop-blur-sm text-white placeholder-red-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="Search for songs, artists, or albums..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                      />
                      <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-300" />
                      {searchLoading && (
                        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {searchError && (
                    <div className="p-2 sm:p-3 bg-red-700/20 border border-red-700/30 rounded-lg text-red-200 text-xs sm:text-sm">
                      {searchError}
                    </div>
                  )}
                  
                  <div className="max-h-60 sm:max-h-96 overflow-y-auto custom-scrollbar">
                    {searchResults.length === 0 && !searchLoading && !search.trim() && (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Music className="w-6 h-6 sm:w-8 sm:h-8 text-red-300" />
                        </div>
                        <p className="text-red-200 font-medium text-sm sm:text-base">Start typing to search</p>
                        <p className="text-xs sm:text-sm text-red-300 mt-1">Search for songs, artists, or albums</p>
                      </div>
                    )}
                    {searchResults.length === 0 && !searchLoading && search.trim() && (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-6 h-6 sm:w-8 sm:h-8 text-red-300" />
                        </div>
                        <p className="text-red-200 font-medium text-sm sm:text-base">No results found</p>
                        <p className="text-xs sm:text-sm text-red-300 mt-1">Try a different search term</p>
                      </div>
                    )}
                    <div className="space-y-2 sm:space-y-3">
                      {searchResults.map((item, idx) => (
                        <motion.div
                          key={item.videoId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="relative flex-shrink-0">
                            <img 
                              src={item.thumbnail} 
                              alt={item.title} 
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg shadow-lg object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-semibold text-white text-xs sm:text-base leading-tight line-clamp-2 mb-1">{item.title}</h4>
                            <p className="text-xs sm:text-sm text-red-200 opacity-80">Click to add to queue</p>
                          </div>
                          <div className="flex-shrink-0">
                            <Button
                              onClick={() => handleAddToQueue(item)}
                              className="cursor-pointer bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-medium px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
                            >
                              <span className="text-lg font-bold">+</span>
                              <span>Add</span>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Player and Queue Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-8">
            {/* Player Section */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="xl:col-span-2"
            >
              <Card className="relative overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
                {/* Background Image */}
                {currentSong?.thumbnail && (
                  <div className="absolute inset-0">
                    <img
                      src={currentSong.thumbnail}
                      alt="background"
                      className="w-full h-full object-cover"
                      style={{ filter: 'blur(20px) brightness(0.3)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  </div>
                )}
                
                <CardContent className="relative z-10 p-5 sm:p-14"> 
                  <div className="aspect-video sm:aspect-[21/9] pt-6 ">
                    {videoId ? (
                      <>
                        <SyncAudio
                          roomId={roomId}
                          videoId={videoId}
                          isHost={true}
                          onPlayNext={handlePlayNext}
                          onPlayPrev={handlePlayPrev}
                        />
                        {currentSong && (
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mt-10 sm:mt-16"
                          >
                            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <img 
                                  src={currentSong.thumbnail} 
                                  alt={currentSong.title}
                                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg shadow-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-white text-sm sm:text-lg truncate">{currentSong.title}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs sm:text-sm text-green-300 font-medium">Now Playing</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Music className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-white text-xl font-bold mb-2">No song playing</p>
                        <p className="text-red-200">Add some music to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Queue Section */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="xl:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl h-[350px] sm:h-[450px] xl:h-[600px] flex flex-col">
                {/* Queue Header */}
                <div className="p-3 sm:p-6 pb-2 sm:pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Music className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white">Up Next</h3>
                        <p className="text-xs sm:text-sm text-red-200">{queue.length} {queue.length === 1 ? 'song' : 'songs'} in queue</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsQueueCollapsed(!isQueueCollapsed)}
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors xl:hidden"
                    >
                      {isQueueCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Queue Content */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar ${isQueueCollapsed ? 'hidden xl:block' : 'block'}`}>
                  <div className="p-3 sm:p-6 pt-2 sm:pt-4">
                    <QueueList 
                      roomId={roomId} 
                      queue={queue}
                      onSelect={(id) => {
                        setVideoId(id);
                        console.log('[Socket] emitting change-video', { roomId, newVideoId: id });
                        getSocket().emit('change-video', { roomId, newVideoId: id });
                      }} 
                      currentVideoId={videoId} 
                      onRemove={handleRemoveFromQueue}
                      removingQueueItemId={removingQueueItemId}
                      setRemovingQueueItemId={setRemovingQueueItemId}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
      `}</style>
    </div>
  );
}