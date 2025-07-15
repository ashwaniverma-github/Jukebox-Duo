"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Music, Plus, Users, Copy, ExternalLink, Play, Radio, Zap, Heart, Share, Share2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader as DialogHeaderUI,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";

interface Room {
  id: string;
  name: string;
  createdAt?: string;
  participantCount?: number;
}

export default function Dashboard() {
  const { status } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadRooms();
    }
  }, [status]);

  async function loadRooms() {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error("Failed to load rooms:", error);
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const room = await res.json();
      if (room?.id) {
        const link = `${window.location.origin}/room/${room.id}`;
        setShareLink(link);
        setShowShareModal(true);
        setName("");
        await loadRooms();
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const joinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  // Add this handler inside the Dashboard component
  const handleDeleteRoom = async (roomId: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
        setRoomToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete room');
      }
    } catch (error) {
      alert('Failed to delete room');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-gray-900/40 to-black" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-800/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="relative z-10 flex justify-between items-center p-6 lg:p-4">
          <div className="flex items-center gap-3">
            
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Live Sessions</span>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row relative z-10">
          {/* Left Side - Hero Content */}
          <div className="flex-1 flex flex-col justify-center px-6 lg:px-12  ">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="block text-white">Listen</span>
                <span className="block bg-gradient-to-r from-red-400 via-red-600 to-gray-400 bg-clip-text text-transparent">
                  Together
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                Create synchronized music rooms where friends can listen to the same tracks at the exact same time. 
                Share the moment, share the beat.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2 text-gray-400">
                  <Radio className="w-5 h-5 text-red-400" />
                  <span className="text-sm">Real-time Sync</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Zap className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Zero Latency</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="text-sm">Unlimited Users</span>
                </div>
              </div>

              {/* Create Room Form */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 lg:p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-2 text-white">Create Your Room</h3>
                <p className="text-gray-400 mb-6">Start a new synchronized listening session</p>
                
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Enter room name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20 text-lg rounded-xl backdrop-blur-sm"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-700 to-red-500 rounded-lg flex items-center justify-center">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isCreating || !name.trim()}
                    className="w-full h-14 bg-gradient-to-r from-red-700 via-red-500 to-gray-800 hover:from-red-800 hover:via-red-600 hover:to-black text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isCreating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Room...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create Room
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Side - Active Rooms */}
          <div className="flex-1 lg:max-w-lg px-6 lg:px-12 py-8 lg:py-16">
            <div className="sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Active Rooms</h2>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">{rooms.length} live</span>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {rooms.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Music className="w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No active rooms</h3>
                    <p className="text-gray-400 text-sm">Be the first to start a session!</p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <div key={room.id} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white truncate flex-1 mr-2">
                          {room.name || "Unnamed Room"}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {room.participantCount || 0} listening
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => joinRoom(room.id)}
                          className="flex-1 h-10 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Join
                        </Button>
                        <Button
                          onClick={() => {
                            const link = `${window.location.origin}/room/${room.id}`;
                            setShareLink(link);
                            setShowShareModal(true);
                          }}
                          className="px-4 h-10 bg-white/10 hover:bg-red-900/40 text-white border border-white/20 rounded-lg transition-all duration-200"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        {/* Delete button for host */}
                        <Button
                          onClick={() => setRoomToDelete(room)}
                          className="px-4 h-10 bg-red-700 hover:bg-red-900 text-white border border-red-800 rounded-lg transition-all duration-200"
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
          <DialogHeaderUI>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Share Room
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Copy this link to invite others to your music room
            </DialogDescription>
          </DialogHeaderUI>
          
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 relative">
              <Input 
                type="text" 
                value={shareLink} 
                readOnly 
                className="h-12 bg-white/10 border-white/20 text-white text-sm pr-12 rounded-xl backdrop-blur-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <Button 
              onClick={copyToClipboard} 
              className="h-12 px-4 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          {copied && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mt-3 animate-fadeIn">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              Link copied successfully!
            </div>
          )}
          
          <DialogFooter className="mt-6 flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowShareModal(false)}
              className="flex-1 h-11 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowShareModal(false);
                joinRoom(shareLink.split("/").pop() || "");
              }}
              className="flex-1 h-11 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              <Play className="w-4 h-4 mr-2" />
              Join Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!roomToDelete} onOpenChange={(open) => { if (!open) setRoomToDelete(null); }}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
          <DialogHeaderUI>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Delete Room
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete the room <span className="font-semibold text-white">{roomToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeaderUI>
          <DialogFooter className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setRoomToDelete(null)}
              className="flex-1 h-11 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => roomToDelete && handleDeleteRoom(roomToDelete.id)}
              className="flex-1 h-11 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}