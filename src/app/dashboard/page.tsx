"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Music, Plus, Users, Play, Radio, Zap, Heart, LogOut } from "lucide-react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from "next/link";
import { ManageBillingButton } from '../../components/ManageBillingButton';
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
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRoomId, setNewRoomId] = useState<string>("");
  const [isSigningout, setIsSigningOut] = useState(false)
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadRooms();
      // Fetch premium status
      fetch('/api/user/premium-status')
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setIsPremium(data.isPremium) })
        .catch(() => { });
    }
  }, [status]);

  async function loadRooms() {
    setIsLoadingRooms(true);
    try {
      const res = await fetch("/api/rooms");

      // If user doesn't exist in DB (deleted), sign them out
      if (res.status === 401 || res.status === 403) {
        await signOut({ callbackUrl: "/signin" });
        return;
      }

      const data = await res.json();

      // Handle case where response has an error or rooms is not an array
      if (data.error || !Array.isArray(data)) {
        await signOut({ callbackUrl: "/signin" });
        return;
      }

      setRooms(data);
    } catch (error) {
      console.error("Failed to load rooms:", error);
    } finally {
      setIsLoadingRooms(false);
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
        setNewRoomId(room.id);
        setShowJoinModal(true);
        setName("");
        await loadRooms();
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
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
      console.error(`Failed to delete room ${error}`)
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignout = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ callbackUrl: "/signin" })
    } catch (error) {
      console.error('Failed to signout ', error)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white overflow-hidden flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-gray-900/40 to-black" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-800/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col min-h-0">
        {/* Navigation */}
        <nav className="relative z-20 flex justify-between items-center px-6 py-3 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl shrink-0">
          <Link href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-1">
            Jukebox<span className="text-red-500">Duo</span>
          </Link>

          {/* Profile Avatar + Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Profile'}
                  className="w-10 h-10 rounded-full border-2 border-white/30 shadow-lg cursor-pointer object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-white/30 shadow-lg bg-white/10 flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:scale-105 transition-transform">
                  {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
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
                      {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-semibold text-base">{session?.user?.name || 'User'}</div>
                    <div className="text-xs text-red-200">{session?.user?.email || ''}</div>
                  </div>
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
                <DropdownMenu.Item
                  onSelect={() => { window.open('/games/higher-lower', '_blank', 'noopener,noreferrer'); }}
                  className="w-full px-4 py-2 rounded-lg text-left hover:bg-purple-700/30 transition-colors cursor-pointer font-medium flex items-center gap-2"
                >
                  <span>🎵</span>
                  <span>Higher or Lower Game</span>
                </DropdownMenu.Item>
                <ManageBillingButton isPremium={isPremium} />
                <DropdownMenu.Item
                  onSelect={handleSignout}
                  className="w-full px-4 py-2 rounded-lg text-left hover:bg-white/20 transition-colors cursor-pointer font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {isSigningout ? 'Signing out...' : 'Sign Out'}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>



        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row relative z-10 min-h-0 overflow-auto">
          {/* Left Side - Hero Content */}
          <div className="flex-1 flex flex-col justify-center px-6 lg:px-10 py-4 lg:py-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                <span className="block text-white">Listen</span>
                <span className="block bg-gradient-to-r from-red-400 via-red-600 to-gray-400 bg-clip-text text-transparent">
                  Together
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-300 mb-5 leading-relaxed">
                Create synchronized music rooms where friends can listen to the same tracks at the exact same time.
                Share the moment, share the beat.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-5">
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
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 lg:p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-1 text-white">Create Your Room</h3>
                <p className="text-gray-400 mb-4 text-sm">Start a new synchronized listening session</p>

                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Enter room name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20 text-base rounded-xl backdrop-blur-sm"
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
                    className="w-full h-12 bg-gradient-to-r from-red-700 via-red-500 to-gray-800 hover:from-red-800 hover:via-red-600 hover:to-black text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          <div className="flex-1 lg:max-w-lg px-6 lg:px-10 py-4 lg:py-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Active Rooms</h2>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">{rooms.length} live</span>
                </div>
              </div>

              <div className="space-y-3">
                {isLoadingRooms ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-3 border-white/20 border-t-red-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 text-sm">Loading rooms...</p>
                  </div>
                ) : rooms.length === 0 ? (
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

      {/* Join Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
          <DialogHeaderUI>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Room Created!
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Your room is ready. Join now to start listening.
            </DialogDescription>          </DialogHeaderUI>
          <DialogFooter className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowJoinModal(false)}
              className="flex-1 h-11 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowJoinModal(false);
                joinRoom(newRoomId);
              }}
              className="flex-1 h-11 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              <Play className="w-4 h-4 mr-2" />
              Join Room
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