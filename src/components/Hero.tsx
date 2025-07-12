import React from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

const Navbar = () => (
  <motion.nav
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.1 }}
    style={{
      width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.5rem 2rem 1.2rem 1rem', position: 'relative', zIndex: 10, fontFamily: 'var(--font-inter)'
    }}
  >
    <a href="/" style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-1px', color: '#fff', textDecoration: 'none' }}>
      <span style={{ color: '#FF5A5F' }}>●</span> Music Duo
    </a>
    <div style={{ display: 'flex', alignItems: 'center', gap: '2.2rem' }}>
      <a href="#about" style={{ color: '#fff', opacity: 0.85, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>About</a>
      <a href="#features" style={{ color: '#fff', opacity: 0.85, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>Features</a>
      <a href="#contact" style={{ color: '#fff', opacity: 0.85, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>Contact</a>
      <button
        onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
        style={{
          marginLeft: '1.5rem', background: '#fff', color: '#FF5A5F', fontWeight: 700, fontSize: '1.05rem',
          padding: '0.6rem 1.6rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px #fff5',
          fontFamily: 'var(--font-inter)', transition: 'background 0.15s, color 0.15s'
        }}
      >
        Sign Up
      </button>
    </div>
  </motion.nav>
);

const Hero = () => (
  <section style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '80vh', padding: '0 1rem 2rem 1rem', textAlign: 'center', position: 'relative',
    background: 'none',
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
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '1rem' }}>
        Listen Together, No Matter Where You Are
      </h1>
      <p style={{ fontSize: '1.25rem', maxWidth: 600, margin: '5px auto 2rem auto', color: '#fff', opacity: 0.9 , gap: '10px' }}>
        Create rooms, queue your favorite YouTube tunes <br /> and play/pause in perfect sync with friends.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <a href="/dashboard" style={{
          background: '#FF5A5F', color: '#fff', fontWeight: 700, fontSize: '1.1rem',
          padding: '0.9rem 2.2rem', borderRadius: '2rem', textDecoration: 'none', boxShadow: '0 2px 12px rgba(255,90,95,0.15)',
          fontFamily: 'var(--font-inter)'
        }}>Try Now</a>
        <a href="#features" style={{
          background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: '1.1rem',
          padding: '0.9rem 2.2rem', borderRadius: '2rem', textDecoration: 'none', border: '1.5px solid #fff', opacity: 0.85,
          fontFamily: 'var(--font-inter)'
        }}>See How It Works</a>
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
          <circle cx="100" cy="70" r="24" fill="#FF5A5F" />
          <circle cx="320" cy="90" r="24" fill="#FF5A5F" />
          <path d="M124 70 Q170 100 296 90" stroke="#FF5A5F" strokeWidth="4" fill="none" />
          <rect x="90" y="110" width="40" height="8" rx="4" fill="#fff" fillOpacity="0.18" />
          <rect x="310" y="130" width="40" height="8" rx="4" fill="#fff" fillOpacity="0.18" />
          {/* Musical notes */}
          <g>
            <path d="M180 60 Q182 50 190 55 Q198 60 196 70" stroke="#FF5A5F" strokeWidth="2.5" fill="none" />
            <ellipse cx="196" cy="70" rx="4" ry="6" fill="#FF5A5F" />
            <path d="M240 80 Q242 70 250 75 Q258 80 256 90" stroke="#FF5A5F" strokeWidth="2.5" fill="none" />
            <ellipse cx="256" cy="90" rx="4" ry="6" fill="#FF5A5F" />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  </section>
);

export default Hero; 