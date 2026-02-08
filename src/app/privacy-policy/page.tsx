"use client"
import { motion } from 'framer-motion';
import { Music, Shield, Eye, Lock, Users, Globe } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
              Privacy
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"> Policy</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we protect and handle your information.
            </p>
          </motion.div>

          {/* Last Updated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8"
          >
            <p className="text-gray-300 text-center">
              <strong>Last updated:</strong> February 8, 2026
            </p>          </motion.div>

          {/* Information We Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Information We Collect</h2>
            </div>
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Account Information</h3>
                <p>When you sign up using Google OAuth, we collect:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Your name and email address (from Google)</li>
                  <li>Profile picture (optional, from Google)</li>
                  <li>Account creation timestamp</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Usage Information</h3>
                <p>We collect information about how you use our service:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Room creation and participation</li>
                  <li>Songs added to queues</li>
                  <li>Playback controls and interactions</li>
                  <li>Connection times and session duration</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Technical Information</h3>
                <p>We automatically collect:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Connection logs and error reports</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* How We Use Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our music collaboration service</li>
                <li>Enable real-time synchronization between users</li>
                <li>Manage room access and user permissions</li>
                <li>Improve our service and develop new features</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Ensure security and prevent abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </motion.div>

          {/* Information Sharing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Information Sharing</h2>
            </div>
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Room Participants</h3>
                <p>When you join a room, other participants can see:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Your name and profile picture</li>
                  <li>Your online status</li>
                  <li>Songs you add to the queue</li>
                  <li>Your playback controls</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Third-Party Services</h3>
                <p>We may share information with:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Google (for authentication and YouTube integration)</li>
                  <li>Cloud service providers (for hosting and infrastructure)</li>
                  <li>Analytics services (for service improvement)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Legal Requirements</h3>
                <p>We may disclose information if required by law or to protect our rights and safety.</p>
              </div>
            </div>
          </motion.div>

          {/* Data Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Data Security</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>We implement appropriate security measures to protect your information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication through Google OAuth</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure hosting infrastructure</li>
              </ul>
            </div>
          </motion.div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Your Rights</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of certain data collection</li>
                <li>Request data portability</li>
                <li>Contact us with privacy concerns</li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-red-700/20 to-pink-700/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20 mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Contact Us</h2>
            <div className="space-y-4 text-gray-300">
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <div className="flex items-center gap-2">
                <span>• X (Twitter):</span>
                <a
                  href="https://x.com/ashwanivermax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 underline"
                >
                  @ashwanivermax
                </a>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Music className="w-5 h-5" />
              Start Making Music
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
