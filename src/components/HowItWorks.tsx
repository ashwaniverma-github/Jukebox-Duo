import React from "react";
import { motion } from "framer-motion";
import { Search, Link, Music } from "lucide-react";

const steps = [
  {
    icon: <Link className="w-8 h-8 text-rose-500" />,
    title: "Create & Share",
    desc: "Instantly create a room and invite others to join.",
  },
  {
    icon: <Search className="w-8 h-8 text-rose-500" />,
    title: "Search & Queue",
    desc: "Search YouTube directly within the app and build your shared queue.",
  },
  {
    icon: <Music className="w-8 h-8 text-rose-500" />,
    title: "Play in Sync",
    desc: "Press play and everyone listens together. Perfect synchronization.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            How it works
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-light">
            Three simple steps to start your listening party.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative text-center group"
            >
              {/* Connector Line (Desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-zinc-800 to-transparent z-0" />
              )}

              <div className="relative z-10 w-24 h-24 mx-auto bg-gradient-to-br from-zinc-900 to-black rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-rose-500/5 ring-1 ring-white/10 group-hover:ring-rose-500/50">
                {step.icon}
                <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{step.title}</h3>
              <p className="text-zinc-400 leading-relaxed font-light text-lg px-4">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;