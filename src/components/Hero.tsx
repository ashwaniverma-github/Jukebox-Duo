import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Menu, X, AlertTriangle, Heart } from "lucide-react";

// Donation link from room page
const DONATION_LINK = "https://www.paypal.com/ncp/payment/BHH3LHQ3XLU48";
const DONATION_TARGET = 50;

// Server Maintenance Banner Component
const ServerMaintenanceBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="fixed top-[72px] left-0 w-full z-40 px-4 py-3 bg-gradient-to-r from-red-900/95 via-red-800/95 to-red-900/95 backdrop-blur-md border-b border-red-500/30"
  >
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-center md:text-left">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse" />
        <span className="font-bold text-white text-sm md:text-base">
          ⚠️ Service Temporarily Unavailable
        </span>
      </div>
      <p className="text-red-100/90 text-xs md:text-sm max-w-xl">
        Our database compute is overdue due to heavy usage and all services are currently shut down.
        We need to raise <span className="font-bold text-yellow-300">${DONATION_TARGET}</span> to restore all services.
      </p>
      <a
        href={DONATION_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-full text-sm transition-all hover:scale-105 shadow-lg"
      >
        <Heart className="w-4 h-4" />
        Donate Now
      </a>
    </div>
  </motion.div>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-50 backdrop-blur-md bg-black/20 border-b border-white/5"
    >
      <div className="flex items-center gap-2">

        <Link href="/" className="font-bold text-xl tracking-tight text-white">
          Jukebox<span className="text-red-500">Duo</span>
        </Link>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8">
        {["Features", "About", "Contact"].map((item) => (
          <Link
            key={item}
            href={`/${item.toLowerCase()}`}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Desktop CTA - DISABLED */}
      <div className="hidden md:flex items-center gap-4">
        <button
          disabled
          className="text-sm font-medium text-gray-500 cursor-not-allowed opacity-50"
          title="Service temporarily unavailable"
        >
          Sign In
        </button>
        <button
          disabled
          className="bg-gray-600 text-gray-400 px-5 py-2 rounded-full text-sm font-semibold cursor-not-allowed opacity-50"
          title="Service temporarily unavailable"
        >
          Get Started
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-white p-2"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
        >
          {["Features", "About", "Contact"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-lg font-medium text-gray-300 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="h-px bg-white/10 my-2" />
          <button
            disabled
            className="w-full py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed opacity-50"
            title="Service temporarily unavailable"
          >
            Sign In
          </button>
          {/* Donation button in mobile menu */}
          <a
            href={DONATION_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-lg font-bold text-center flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Support Us - Donate
          </a>
        </motion.div>
      )}
    </motion.nav>
  );
};

const AudioVisualizer = () => {
  return (
    <div className="flex items-center justify-center gap-1 h-16 md:h-24">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 md:w-3 bg-gradient-to-t from-red-600 to-red-400 rounded-full"
          animate={{
            height: ["20%", "80%", "40%", "100%", "30%"],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: i * 0.1,
          }}
          style={{
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      <Navbar />
      <ServerMaintenanceBanner />

      {/* Clean Background - Removed heavy blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-black to-black" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-sm text-gray-300 font-medium">
              Vibe together in real-time
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Music is better <br />
          <span className="text-white">
            when shared.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Create a room, invite your friends, and listen to your favorite tracks
          in perfect sync. No more counting down to press play.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            disabled
            className="group relative px-8 py-4 bg-gray-700 text-gray-400 rounded-full font-semibold cursor-not-allowed opacity-50 flex items-center gap-2"
            title="Service temporarily unavailable"
          >
            Start Listening
            <Play className="w-4 h-4 fill-current" />
            <div className="absolute inset-0 rounded-full ring-4 ring-gray-600/20 transition-all" />
          </button>
          <a
            href={DONATION_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black rounded-full font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <Heart className="w-4 h-4" />
            Support Us - Donate
          </a>
        </motion.div>

        {/* Visualizer Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <div className=" backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col items-center gap-6">
              <AudioVisualizer />
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">
                  Now Playing
                </p>
                <p className="text-white font-medium mt-1">
                  Lo-Fi Beats to Study/Relax To
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero; 