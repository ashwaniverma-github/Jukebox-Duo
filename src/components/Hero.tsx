import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Menu, X, ArrowRight } from "lucide-react";
import { CONFIG } from "@/lib/config";

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed ${CONFIG.MAINTENANCE_MODE ? 'top-10' : 'top-0'} left-0 w-full flex items-center justify-between px-6 py-4 z-50 backdrop-blur-xl bg-zinc-950/70 border-b border-white/5 supports-[backdrop-filter]:bg-zinc-950/50`}
    >
      <div className="flex items-center gap-2">
        <Link href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
          Jukebox<span className="text-rose-500 ml-1">Duo</span>
        </Link>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8">
        {["Features", "About", "Contact"].map((item) => (
          <Link
            key={item}
            href={`/${item.toLowerCase()}`}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={() => router.push("/signin")}
          className="text-sm font-medium text-white hover:text-rose-300 transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => router.push("/signin")}
          className="bg-white text-zinc-950 px-5 py-2 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-colors"
        >
          Get Started
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-4 md:hidden shadow-2xl"
        >
          {["Features", "About", "Contact"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-lg font-medium text-zinc-400 hover:text-white transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="h-px bg-white/10 my-2" />
          <button
            onClick={() => router.push("/signin")}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/20 transition-all font-medium"
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
    <div className="flex items-center justify-center gap-1.5 h-16 md:h-24 px-4">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 md:w-2 bg-gradient-to-t from-rose-500 via-rose-400 to-rose-300/50 rounded-full"
          animate={{
            height: ["20%", "80%", "40%", "100%", "30%"],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: i * 0.08,
          }}
          style={{
            opacity: 0.9,
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
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/5 via-zinc-950 to-zinc-950" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl shadow-rose-500/10 hover:border-white/20 transition-all cursor-default group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-sm text-zinc-300 font-medium group-hover:text-white transition-colors">
              Your desktop music companion
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight"
        >
          Queue up{" "}
          <motion.span
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center text-rose-500/70 align-middle"
          >
            <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
          </motion.span>{" "}
          Tune in <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
            Together or solo
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          Stream music right from your browser - solo while you focus, or in perfect sync with friends. No downloads, no ads, just music.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-4 mb-20"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push("/signin")}
              className="group relative px-8 py-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-full font-semibold transition-all hover:shadow-[0_0_40px_-10px_rgba(225,29,72,0.5)] flex items-center gap-2"
            >
              Start Listening
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-full font-semibold transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              How it works
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-sm text-zinc-500 tracking-[0.2em] font-medium">
            Limited Time: Get <span className="text-zinc-300">Lifetime Access</span> for just $12.99
          </p>        </motion.div>

        {/* Visualizer Demo */}
        {/* Visualizer Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-4xl mx-auto my-4"
        >
          {/* Glow effect behind visualizer */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-rose-500/20 blur-[100px] rounded-full opacity-30 pointer-events-none" />

          <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-[3rem] p-8 md:p-12">
            <div className="flex flex-col items-center gap-6">
              <AudioVisualizer />
              <div className="text-center mt-4 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs text-rose-300/80 font-mono uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Now Playing
                </div>
                <p className="text-white font-medium text-lg tracking-tight">
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