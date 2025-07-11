import React from "react";
import { motion } from "framer-motion";

const CTABanner = () => (
  <motion.section
    style={{
      width: '100%', background: '#FF5A5F', color: '#fff', padding: '2.5rem 1rem', textAlign: 'center',
      boxShadow: '0 2px 12px rgba(255,90,95,0.10)', margin: '3rem 0 0 0', fontFamily: 'var(--font-headline, sans-serif)'
    }}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.7 }}
  >
    <motion.h2
      style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.2rem' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.7 }}
    >
      Ready to start listening together?
    </motion.h2>
    <motion.a
      href="/dashboard"
      style={{
        background: '#fff', color: '#FF5A5F', fontWeight: 700, fontSize: '1.1rem',
        padding: '0.9rem 2.2rem', borderRadius: '2rem', textDecoration: 'none', boxShadow: '0 2px 12px rgba(10,31,68,0.10)',
        fontFamily: 'var(--font-headline, sans-serif)'
      }}
      whileHover={{ scale: 1.06, boxShadow: '0 4px 24px #fff8' }}
      transition={{ type: 'spring', stiffness: 80, damping: 14 }}
    >
      Create Your First Room — It’s Free
    </motion.a>
  </motion.section>
);

export default CTABanner; 