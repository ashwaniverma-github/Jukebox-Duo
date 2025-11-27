import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Best virtual listening party app I've used! The sync is actually perfect.",
    author: "Jane D.",
    role: "Music Lover",
  },
  {
    quote: "Finally, my playlists with friends stay in perfect time. No more '3, 2, 1, play'.",
    author: "Carlos M.",
    role: "DJ Enthusiast",
  },
  {
    quote: "I use this every day to listen to music with my partner while we work remotely.",
    author: "Sarah K.",
    role: "Remote Worker",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Loved by listeners
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-2xl relative"
            >
              <Quote className="w-8 h-8 text-red-500/50 mb-4" />
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-white font-bold">{t.author}</p>
                <p className="text-red-400 text-sm">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 