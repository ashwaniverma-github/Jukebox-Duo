import React from "react";
import { motion } from "framer-motion";

const Footer = () => (
  <motion.footer
    style={{
      background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '2rem 1rem 1.5rem 1rem', textAlign: 'center',
      fontSize: '1rem', marginTop: '3rem', borderTop: '1.5px solid rgba(255,255,255,0.1)', opacity: 0.98,
      fontFamily: 'var(--font-inter)'
    }}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.7 }}
  >
    <nav style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
      <a href="#about" style={{ color: '#fff', textDecoration: 'none', opacity: 0.85 }}>About</a>
      <a href="https://github.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', opacity: 0.85 }}>GitHub</a>
      <a href="#privacy" style={{ color: '#fff', textDecoration: 'none', opacity: 0.85 }}>Privacy Policy</a>
      <a href="#contact" style={{ color: '#fff', textDecoration: 'none', opacity: 0.85 }}>Contact</a>
    </nav>
    <div style={{ color: '#fff', opacity: 0.7, fontSize: '0.95rem' }}>
      © 2025 MusicDuo. 
    </div>
  </motion.footer>
);

export default Footer; 