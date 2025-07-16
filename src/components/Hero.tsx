import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="fixed top-0 left-0 w-full  flex items-center justify-between px-4 py-3 md:py-5 font-sans bg backdrop-blur-lg  z-1"
    >
      {/* Left: Hamburger + Logo (mobile), Logo only (desktop) */}
      <div className="flex items-center flex-1 md:flex-none">
        {/* Hamburger (mobile only) */}
        <button
          aria-label="Open menu"
          className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/" className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2 md:ml-0 ml-2">
          <h1 className="text-red-500 text-md flex items-center justify-center">Music Duo</h1>
        </Link>
        {/* Dropdown menu (mobile only) */}
        {menuOpen && (
          <div className="absolute top-14 left-2 bg-gray-900 border border-white/10 rounded-xl shadow-lg py-2 w-44 flex flex-col items-stretch z-50 animate-fade-in">
            <a href="#about" className="px-5 py-3 text-white hover:bg-gray-800 text-center" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#features" className="px-5 py-3 text-white hover:bg-gray-800 text-center" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#contact" className="px-5 py-3 text-white hover:bg-gray-800 text-center" onClick={() => setMenuOpen(false)}>Contact</a>
          </div>
        )}
      </div>

      {/* Center: Links (desktop only) */}
      <div className="hidden md:flex flex-1 items-center justify-center gap-8">
        <a href="#about" className="text-white opacity-85 font-semibold text-base hover:underline">About</a>
        <a href="#features" className="text-white opacity-85 font-semibold text-base hover:underline">Features</a>
        <a href="#contact" className="text-white opacity-85 font-semibold text-base hover:underline">Contact</a>
      </div>

      {/* Right: Sign In/Up (always right) */}
      <div className="flex-1 flex items-center justify-end">
        <button
          onClick={() => router.push('/signin')}
          className="ml-2 md:ml-0 cursor-pointer bg-white text-red-500 font-bold text-base px-5 py-2 rounded-full shadow-md transition-colors duration-150 hover:bg-red-100"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Sign In
        </button>
      </div>
    </motion.nav>
  );
};

const Hero = () => {
  const router = useRouter();
  return (
    <section
      className="flex flex-col items-center justify-center min-h-[80vh] pt-30 md:pt-40 px-4 pb-8 text-center relative font-sans"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2 text-white">
          Listen Together
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white">
          No Matter Where You Are
        </h2>
        
        <p style={{ fontSize: '1.25rem', maxWidth: 600, margin: '5px auto 2rem auto', color: '#fff', opacity: 0.9 , gap: '10px' }}>
          Create rooms, queue your favorite YouTube tunes <br /> and play/pause in perfect sync with friends.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/signin')}
            className="cursor-pointer bg-gradient-to-r from-red-700 to-red-500 text-white font-bold text-[1.1rem] px-9 py-3 rounded-full shadow-md hover:from-red-800 hover:to-red-600 transition-all duration-200"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Try Now
          </button>
          <a href="#features" className="bg-white/10 text-white font-semibold text-[1.1rem] px-9 py-3 rounded-full border border-white/20 opacity-85 hover:bg-white/20 transition-all duration-200" style={{ fontFamily: 'var(--font-inter)' }}>See How It Works</a>
        </div>
        {/* Placeholder SVG illustration with musical vibe */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
          style={{ maxWidth: 420, margin: '0 auto' }}
        >
          <svg width="100%" height="180" viewBox="0 0 420 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="210" cy="170" rx="180" ry="10" fill="#fff" fillOpacity="0.08" />
            <rect x="60" y="40" width="80" height="60" rx="16" fill="#fff" fillOpacity="0.12" />
            <rect x="280" y="60" width="80" height="60" rx="16" fill="#fff" fillOpacity="0.12" />
            <circle cx="100" cy="70" r="24" fill="#ef4444" />
            <circle cx="320" cy="90" r="24" fill="#ef4444" />
            <path d="M124 70 Q170 100 296 90" stroke="#b91c1c" strokeWidth="4" fill="none" />
            <rect x="90" y="110" width="40" height="8" rx="4" fill="#fff" fillOpacity="0.18" />
            <rect x="310" y="130" width="40" height="8" rx="4" fill="#fff" fillOpacity="0.18" />
            {/* Musical notes */}
            <g>
              <path d="M180 60 Q182 50 190 55 Q198 60 196 70" stroke="#b91c1c" strokeWidth="2.5" fill="none" />
              <ellipse cx="196" cy="70" rx="4" ry="6" fill="#ef4444" />
              <path d="M240 80 Q242 70 250 75 Q258 80 256 90" stroke="#b91c1c" strokeWidth="2.5" fill="none" />
              <ellipse cx="256" cy="90" rx="4" ry="6" fill="#ef4444" />
            </g>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero; 