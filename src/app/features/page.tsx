"use client"
import { motion } from 'framer-motion';
import { Music, Users, Clock, Share2, Heart, Zap, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Jukebox Duo</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Features that make music
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"> magical</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover what makes Jukebox Duo the ultimate collaborative music experience
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Collaboration</h3>
                           <p className="text-gray-300">
               Create music rooms and invite friends to join. Everyone can add songs, control playback, and see who&apos;s online in real-time.
             </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Synchronized Playback</h3>
              <p className="text-gray-300">
                Perfect sync across all devices. When one person plays, pauses, or skips, everyone stays in perfect harmony.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Easy Sharing</h3>
              <p className="text-gray-300">
                Share room links with friends instantly. No downloads, no accounts required for guests - just click and join.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">YouTube Integration</h3>
              <p className="text-gray-300">
                Search and add any song from YouTube&apos;s vast library. Instant access to millions of tracks with thumbnails and metadata.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-300">
                Built with Next.js and WebSockets for instant updates. No lag, no buffering - just smooth, responsive music control.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Private</h3>
              <p className="text-gray-300">
                Google OAuth authentication, encrypted connections, and room-based access control keep your music sessions secure.
              </p>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Globe className="w-5 h-5" />
              Start Your Music Room
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
