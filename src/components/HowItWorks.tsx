import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="16" width="32" height="20" rx="6" fill="#ef4444"/><rect x="16" y="24" width="16" height="4" rx="2" fill="#fff"/><rect x="20" y="30" width="8" height="2" rx="1" fill="#fff"/></svg>
    ),
    title: "Create & Share",
    desc: "Instantly get a shareable room link"
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="12" width="32" height="24" rx="8" fill="#fff" fillOpacity="0.12"/><rect x="14" y="20" width="20" height="8" rx="4" fill="#ef4444"/><rect x="18" y="24" width="12" height="2" rx="1" fill="#fff"/></svg>
    ),
    title: "Search & Queue",
    desc: "Search YouTube and add songs to your room's queue"
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" fill="#fff" fillOpacity="0.12"/><polygon points="20,16 34,24 20,32" fill="#ef4444"/><rect x="12" y="22" width="4" height="4" rx="2" fill="#fff"/><rect x="32" y="22" width="4" height="4" rx="2" fill="#fff"/></svg>
    ),
    title: "Play in Sync",
    desc: "All participants hear every play/pause together"
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
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 80, damping: 12 } }
};

const HowItWorks = () => (
  <motion.section id="how-it-works" style={{ padding: '4rem 1rem 3rem 1rem', fontFamily: 'var(--font-inter)' }}
    initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={container}
  >
    <motion.h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem', color: '#fff' }}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
    >
      How It Works
    </motion.h2>
    <motion.div style={{
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', maxWidth: 1000, margin: '0 auto'
    }} variants={container}>
      {steps.map((step, i) => (
        <motion.div key={i} variants={item} whileHover={{ scale: 1.04, boxShadow: '0 4px 24px rgba(239,68,68,0.2)' }} style={{
          flex: '1 1 220px', minWidth: 220, maxWidth: 320, background: 'rgba(255,255,255,0.04)',
          borderRadius: 18, padding: '2rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(10,31,68,0.08)',
          fontFamily: 'var(--font-inter)'
        }}>
          <div style={{ marginBottom: 18 }}>{step.icon}</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>{step.title}</h3>
          <p style={{ color: '#fff', opacity: 0.85, fontSize: '1rem' }}>{step.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  </motion.section>
);

export default HowItWorks; 