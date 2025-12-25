import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, AlertTriangle } from "lucide-react";

// Donation link from room page
const DONATION_LINK = "https://www.paypal.com/ncp/payment/BHH3LHQ3XLU48";
const DONATION_TARGET = 50;

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
        {/* Warning notice */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-200 font-medium">
            Service temporarily unavailable - Help us restore it!
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Help us keep the music playing
        </h2>
        <p className="text-xl text-gray-400 mb-4">
          Our database compute is overdue due to heavy usage. We need <span className="text-yellow-400 font-bold">${DONATION_TARGET}</span> to restore all services.
        </p>
        <p className="text-sm text-gray-500 mb-10">
          Every donation helps bring back the music sharing experience you love.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Disabled Create Room button */}
          <motion.button
            disabled
            className="inline-flex items-center gap-2 bg-gray-700 text-gray-400 px-8 py-4 rounded-full font-bold text-lg cursor-not-allowed opacity-50"
          >
            Create Your Room
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          {/* Donation CTA */}
          <motion.a
            href={DONATION_LINK}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-8 py-4 rounded-full font-bold text-lg shadow-lg"
          >
            <Heart className="w-5 h-5" />
            Donate Now
          </motion.a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTABanner; 