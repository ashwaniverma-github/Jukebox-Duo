"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Music, Plus, Users, Copy, ExternalLink, Headphones, Volume2, UserPlus, Play } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error("Failed to load rooms:", error);
    }
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

  return (
    <div className="min-h-screen w-full bg-background text-foreground ">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-400 rounded-full p-4 shadow-lg mb-4">
          <Music className="w-10 h-10 text-white drop-shadow" />
        </div>
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-500 mb-2">
          Music Duo
        </h1>
        <p className="text-lg text-gray-500 max-w-xl text-center">
          Create synchronized music experiences with friends. Listen together, discover together.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start px-4 pb-16">
        {/* Create Room Card */}
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-400 rounded-full p-2">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Create Room</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Start a new music session and invite friends to join
            </CardDescription>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <Input
                  id="roomName"
                  placeholder="My Awesome Playlist"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-400 text-white font-semibold shadow-md hover:from-purple-600 hover:to-pink-500 transition-colors" disabled={isCreating || !name.trim()}>
                <Plus className="w-5 h-5 mr-2" />
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </form>
            <ul className="mt-6 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><Headphones className="w-4 h-4 text-purple-400" /> Sync playback across devices</li>
              <li className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-pink-400" /> Real-time audio synchronization</li>
              <li className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-purple-400" /> Invite unlimited listeners</li>
            </ul>
          </CardContent>
        </Card>

        {/* Active Rooms Card */}
        <Card className="shadow-xl relative overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="bg-gradient-to-br from-green-400 to-teal-400 rounded-full p-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Active Rooms</CardTitle>
            <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">Live</span>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Music className="w-20 h-20 text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No active rooms</h3>
                <p className="text-gray-400 mb-2">Be the first to create a room and start the party!</p>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Play className="w-4 h-4" /> Your music experience awaits
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {rooms.map((room) => (
                  <Card key={room.id} className="border border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <CardTitle className="truncate text-base font-semibold">{room.name || "Unnamed Room"}</CardTitle>
                      <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{room.participantCount || 0} users</span>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <Button variant="secondary" className="w-full flex items-center gap-2" onClick={() => joinRoom(room.id)}>
                        <ExternalLink className="w-4 h-4" /> Join Room
                      </Button>
                      <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => {
                        const link = `${window.location.origin}/room/${room.id}`;
                        setShareLink(link);
                        setShowShareModal(true);
                      }}>
                        <Copy className="w-4 h-4" /> Share Link
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeaderUI>
            <DialogTitle>Share Room Link</DialogTitle>
            <DialogDescription>Share this link with others to invite them to your room:</DialogDescription>
          </DialogHeaderUI>
          <div className="flex items-center gap-2">
            <Input type="text" value={shareLink} readOnly className="flex-1" />
            <Button onClick={copyToClipboard} variant="secondary">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {copied && <p className="text-green-600 text-sm">✓ Link copied to clipboard!</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>Close</Button>
            <Button onClick={() => {
              setShowShareModal(false);
              joinRoom(shareLink.split("/").pop() || "");
            }}>Join Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
