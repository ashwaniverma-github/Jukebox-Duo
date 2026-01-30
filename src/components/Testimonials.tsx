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
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Loved by listeners
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-8 bg-zinc-900 rounded-full text-rose-500 ring-1 ring-zinc-800 shadow-xl">
                <Quote className="w-5 h-5 fill-current" />
              </div>

              <div className="relative z-10">
                <p className="text-xl md:text-2xl text-zinc-300 mb-8 leading-relaxed font-light">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="inline-flex items-center gap-4 bg-zinc-900/50 pr-6 pl-2 py-2 rounded-full border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white font-bold text-sm ring-2 ring-black">
                    {t.author.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm leading-none mb-1">{t.author}</p>
                    <p className="text-rose-500/80 text-xs font-medium uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;