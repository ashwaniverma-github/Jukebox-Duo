import React, { useState } from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Best virtual listening party app I’ve used!",
    author: "Jane D."
  },
  {
    quote: "Finally, my playlists with friends stay in perfect time.",
    author: "Carlos M."
  }
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <motion.section style={{ padding: '4rem 1rem 3rem 1rem', background: 'none', fontFamily: 'var(--font-inter)' }}
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}
    >
      <motion.h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
      >
        Testimonials
      </motion.h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 14 }}
          style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: '2.5rem 2rem', maxWidth: 500,
            boxShadow: '0 2px 12px rgba(10,31,68,0.08)', textAlign: 'center', minHeight: 140,
            fontFamily: 'var(--font-inter)'
          }}
        >
          <p style={{ fontSize: '1.15rem', fontWeight: 500, color: '#fff', opacity: 0.95, marginBottom: 12 }}>
            &quot;{testimonials[index].quote}&quot;
          </p>
          <span style={{ color: '#FF5A5F', fontWeight: 700, fontSize: '1rem' }}>— {testimonials[index].author}</span>
        </motion.div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button aria-label="Previous" onClick={prev} style={{ background: 'none', border: 'none', color: '#FF5A5F', fontSize: 28, cursor: 'pointer' }}>&#8592;</button>
          <span style={{ color: '#fff', opacity: 0.7 }}>{index + 1} / {testimonials.length}</span>
          <button aria-label="Next" onClick={next} style={{ background: 'none', border: 'none', color: '#FF5A5F', fontSize: 28, cursor: 'pointer' }}>&#8594;</button>
        </div>
      </div>
    </motion.section>
  );
};

export default Testimonials; 