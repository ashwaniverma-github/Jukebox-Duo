import React from "react";
import { motion } from "framer-motion";

const CTABanner = () => (
  <motion.section
    className="w-full bg-gradient-to-r from-red-700 to-red-500 text-white py-10 px-4 text-center shadow-lg mt-12 font-sans"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.7 }}
  >
    <motion.h2
      className="text-2xl font-extrabold mb-5"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.7 }}
    >
      Ready to start listening together?
    </motion.h2>
    <motion.a
      href="/dashboard"
      className="bg-white text-red-500 font-bold text-lg px-9 py-3 rounded-full shadow-md inline-block transition-all duration-200 hover:bg-red-100"
      whileHover={{ scale: 1.06, boxShadow: '0 4px 24px #fff8' }}
      transition={{ type: 'spring', stiffness: 80, damping: 14 }}
    >
      Create Your First Room — It&apos;s Free
    </motion.a>
  </motion.section>
);

export default CTABanner; 