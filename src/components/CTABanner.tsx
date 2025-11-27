import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTABanner = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/20 pointer-events-none" />

    <div className="container mx-auto px-4 relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Ready to start listening?
        </h2>
        <p className="text-xl text-gray-400 mb-10">
          Create a room in seconds. No account required for guests.
        </p>

        <motion.a
          href="/dashboard"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors"
        >
          Create Your Room
          <ArrowRight className="w-5 h-5" />
        </motion.a>
      </motion.div>
    </div>
  </section>
);

export default CTABanner; 