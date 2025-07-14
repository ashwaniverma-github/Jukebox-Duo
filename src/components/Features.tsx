import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Real‑Time Sync",
    desc: "Low‑latency play/pause across any device",
    img: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" fill="#fff" fillOpacity="0.10"/><rect x="28" y="36" width="24" height="8" rx="4" fill="#ef4444"/><rect x="36" y="28" width="8" height="24" rx="4" fill="#ef4444"/></svg>
    )
  },
  {
    title: "Collaborative Queue",
    desc: "Everyone can add and reorder tracks",
    img: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><rect x="16" y="24" width="48" height="8" rx="4" fill="#ef4444"/><rect x="16" y="40" width="32" height="8" rx="4" fill="#fff" fillOpacity="0.18"/><rect x="16" y="56" width="40" height="8" rx="4" fill="#fff" fillOpacity="0.18"/></svg>
    )
  },
  {
    title: "No Downloads",
    desc: "Runs entirely in your browser",
    img: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><rect x="20" y="20" width="40" height="40" rx="12" fill="#fff" fillOpacity="0.10"/><rect x="32" y="32" width="16" height="16" rx="4" fill="#ef4444"/></svg>
    )
  },
  {
    title: "Free & Open",
    desc: "Powered by YouTube & WebSockets",
    img: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" fill="#fff" fillOpacity="0.10"/><rect x="28" y="36" width="24" height="8" rx="4" fill="#ef4444"/><circle cx="40" cy="40" r="8" fill="#fff" fillOpacity="0.18"/></svg>
    )
  }
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 80, damping: 14 } }
};

const Features = () => (
  <motion.section id="features" style={{ padding: '4rem 1rem 3rem 1rem', fontFamily: 'var(--font-inter)' }}
    initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={container}
  >
    <motion.h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem', color: '#fff' }}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
    >
      Features
    </motion.h2>
    <motion.div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }} variants={container}>
      {features.map((f, i) => (
        <motion.div key={i} variants={item} whileHover={{ scale: 1.03, boxShadow: '0 4px 24px rgba(239,68,68,0.2)' }} style={{
          display: 'flex', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', alignItems: 'center',
          gap: '2.5rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: '2rem 1.5rem', boxShadow: '0 2px 12px rgba(10,31,68,0.08)',
          fontFamily: 'var(--font-inter)'
        }}>
          <div style={{ flex: '0 0 100px', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 100 }}>
            {f.img}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>{f.title}</h3>
            <p style={{ color: '#fff', opacity: 0.85, fontSize: '1rem' }}>{f.desc}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </motion.section>
);

export default Features; 