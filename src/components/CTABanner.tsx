import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTABanner = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rose-900/10 pointer-events-none" />

    <div className="container mx-auto px-4 relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Open a tab. Press play.
        </h2>
        <p className="text-xl text-zinc-400 mb-10 font-light">
          Your browser is all you need. Create a room in seconds and start listening - solo or with friends.
        </p>

        <motion.a
          href="/dashboard"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_40px_-10px_rgba(225,29,72,0.4)] transition-all"
        >
          Create Your Room
          <ArrowRight className="w-5 h-5" />
        </motion.a>
      </motion.div>
    </div>
  </section>
);

export default CTABanner; 