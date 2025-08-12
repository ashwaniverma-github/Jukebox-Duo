"use client"
import { motion } from 'framer-motion';
import { Music, Twitter, Mail, MessageCircle, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
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
              Get in
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"> Touch</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hello? I'd love to hear from you!
            </p>
          </motion.div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Primary Contact - X/Twitter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Twitter className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Follow on X (Twitter)</h3>
              <p className="text-gray-300 mb-6">
                Stay updated with the latest features, announcements, and music-related content. I'm most active here!
              </p>
              <a
                href="https://x.com/ashwanivermax"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Twitter className="w-5 h-5" />
                @ashwanivermax
              </a>
            </motion.div>

            {/* General Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">General Inquiries</h3>
              <p className="text-gray-300 mb-6">
                For general questions, feedback, or support, reach out to me on X. I typically respond within 24 hours.
              </p>
              <div className="space-y-3">
                                 <div className="flex items-center gap-3 text-gray-300">
                   <Mail className="w-5 h-5 text-red-400" />
                   <span>DM me on X for fastest response</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-300">
                   <MessageCircle className="w-5 h-5 text-red-400" />
                   <span>I love hearing from the community</span>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* What We'd Love to Hear */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-12"
          >
                         <h2 className="text-3xl font-bold text-white mb-6">What I'd Love to Hear</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Feedback & Suggestions</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Feature requests and ideas</li>
                  <li>• Bug reports and issues</li>
                  <li>• UI/UX improvements</li>
                  <li>• Performance feedback</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Community & Support</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• How you're using Jukebox Duo</li>
                  <li>• Success stories and experiences</li>
                  <li>• Questions about features</li>
                  <li>• Technical support</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Response Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-red-700/20 to-pink-700/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20 mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Response Time</h3>
            </div>
                         <p className="text-gray-300">
               I'm a passionate individual builder dedicated to making Jukebox Duo the best it can be. I typically respond to messages within 24 hours, and I read every single message I receive. Your feedback helps me improve and grow!
             </p>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <a
              href="https://x.com/ashwanivermax"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Twitter className="w-5 h-5" />
              Say Hello on X
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
