"use client"
import { motion } from 'framer-motion';
import { Music, Heart, Users, Globe, Code, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
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
              About
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"> Jukebox Duo</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Bringing people together through the universal language of music
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Jukebox Duo was born from a simple idea: music is better when shared. In a world where we're increasingly connected digitally but often isolated physically, we wanted to create a space where friends, families, and communities could come together through music.
              </p>
              <p>
                Whether you're hosting a virtual party, studying with friends, or just want to share your favorite tracks with someone special, Jukebox Duo makes it effortless to create shared musical experiences in real-time.
              </p>
              <p>
                We believe that music has the power to bring people together, create memories, and build connections. That's why we've built a platform that's not just about playing music, but about creating moments together.
              </p>
            </div>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Connect Through Music</h3>
                  <p className="text-gray-300">
                    Create meaningful connections by sharing musical experiences with friends and loved ones, no matter where they are.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Democratize Music Sharing</h3>
                  <p className="text-gray-300">
                    Make collaborative music experiences accessible to everyone, regardless of technical expertise or location.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Global Community</h3>
                  <p className="text-gray-300">
                    Build a worldwide community of music lovers who can discover, share, and enjoy music together.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Innovation First</h3>
                  <p className="text-gray-300">
                    Continuously push the boundaries of what's possible with real-time music collaboration and sharing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Our Values</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Simplicity</h3>
                  <p className="text-gray-300">
                    We believe the best technology is invisible. Our platform should feel natural and intuitive, letting you focus on the music and the people you're sharing it with.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Inclusivity</h3>
                  <p className="text-gray-300">
                    Music is for everyone. We're committed to creating a platform that welcomes all music lovers, regardless of their background, location, or technical skills.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Quality</h3>
                  <p className="text-gray-300">
                    We're passionate about delivering the best possible experience. From audio quality to user interface, every detail matters.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Privacy</h3>
                  <p className="text-gray-300">
                    Your music sessions are private and secure. We respect your privacy and give you full control over who can join your rooms.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Coffee className="w-5 h-5" />
              Join the Music Revolution
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
