import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  return (
    <motion.nav
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      style={{
        width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 2rem 1.2rem 1rem', position: 'relative', zIndex: 10, fontFamily: 'var(--font-inter)'
      }}
    >
      <Link href="/" style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-1px', color: '#fff', textDecoration: 'none' }}>
        <span style={{ color: '#ef4444' }}>●</span> Music Duo
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.2rem' }}>
        <a href="#about" style={{ color: '#fff', opacity: 0.85, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>About</a>
        <a href="#features" style={{ color: '#fff', opacity: 0.85, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>Features</a>
        <a href="#contact" style={{ color: '#fff', opacity: 0.85, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>Contact</a>
        <button
          onClick={() => router.push('/signin')}
          className="ml-6 bg-white text-red-500 font-bold text-[1.05rem] px-6 py-2 rounded-full shadow-md transition-colors duration-150 hover:bg-red-100"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Sign Up
        </button>
      </div>
    </motion.nav>
  );
};

const Hero = () => {
  const router = useRouter();
  return (
    <section style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', padding: '0 1rem 2rem 1rem', textAlign: 'center', position: 'relative',
      fontFamily: 'var(--font-inter)',
      paddingTop: 0
    }}>
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ paddingTop: 20 }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '1rem', color: '#fff' }}>
          Listen Together, No Matter Where You Are
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: 600, margin: '5px auto 2rem auto', color: '#fff', opacity: 0.9 , gap: '10px' }}>
          Create rooms, queue your favorite YouTube tunes <br /> and play/pause in perfect sync with friends.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/signin')}
            className="bg-gradient-to-r from-red-700 to-red-500 text-white font-bold text-[1.1rem] px-9 py-3 rounded-full shadow-md hover:from-red-800 hover:to-red-600 transition-all duration-200"
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