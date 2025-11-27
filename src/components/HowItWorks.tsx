import React from "react";
import { motion } from "framer-motion";
import { Search, Link, Music } from "lucide-react";

const steps = [
  {
    icon: <Link className="w-8 h-8 text-red-500" />,
    title: "Create & Share",
    desc: "Instantly generate a unique room link. No sign-up required for guests.",
  },
  {
    icon: <Search className="w-8 h-8 text-red-500" />,
    title: "Search & Queue",
    desc: "Search YouTube directly within the app and build your shared queue.",
  },
  {
    icon: <Music className="w-8 h-8 text-red-500" />,
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
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Three simple steps to start your listening party.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative p-8 rounded-2xl bg-white/5 border border-white/10 text-center group hover:bg-white/10 transition-colors"
            >
              <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.desc}</p>

              {/* Connector Line (Desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/10 to-transparent transform -translate-y-1/2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 