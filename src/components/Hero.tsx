import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Menu, X, ArrowRight } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
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

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={() => router.push("/signin")}
          className="text-sm font-medium text-white hover:text-red-400 transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => router.push("/signin")}
          className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
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
            onClick={() => router.push("/signin")}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold"
          >
            Sign In
          </button>
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
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      <Navbar />

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
          Create a room, invite your partner or friends, and vibe to music in perfect sync. Built for couples and friends who want to share every beat in real-time .
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => router.push("/signin")}
            className="group relative px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all hover:scale-105 flex items-center gap-2"
          >
            Start Listening
            <Play className="w-4 h-4 fill-current" />
            <div className="absolute inset-0 rounded-full ring-4 ring-red-600/20 group-hover:ring-red-600/40 transition-all" />
          </button>
          <button
            onClick={() => {
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-semibold transition-all hover:scale-105 flex items-center gap-2"
          >
            How it works
            <ArrowRight className="w-4 h-4" />
          </button>
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