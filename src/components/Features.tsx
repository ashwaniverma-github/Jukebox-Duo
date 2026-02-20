import React from "react";
import { motion } from "framer-motion";
import { Zap, ListMusic, Globe, Github } from "lucide-react";

const features = [
  {
    title: "Real-Time Sync",
    desc: "Experience music together with zero latency. When you hit play, it plays for everyone instantly.",
    icon: <Zap className="w-6 h-6 text-rose-500" />,
    gradient: "from-rose-500/10 to-orange-500/10",
  },
  {
    title: "Collaborative Queue",
    desc: "Build the perfect playlist together. Add, remove, and reorder tracks in real-time.",
    icon: <ListMusic className="w-6 h-6 text-blue-400" />,
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    title: "No Downloads Required",
    desc: "Jump straight into the action. Runs entirely in your browser with no software to install.",
    icon: <Globe className="w-6 h-6 text-emerald-400" />,
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    title: "Open Source",
    desc: "Transparent and community-driven. Powered by YouTube and built with modern web tech.",
    icon: <Github className="w-6 h-6 text-purple-400" />,
    gradient: "from-purple-500/10 to-violet-500/10",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >

          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
            Solo or together
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              the room is yours.
            </span>
          </h2>

          <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
            Simple, powerful features designed to make <br className="hidden md:block" />
            listening seamless and fun.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-[2.5rem] transition-all duration-500 overflow-hidden"
            >
              {/* Soft background that appears on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] blur-xl`}
              />
              <div
                className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"
              />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl border border-white/5">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed font-light text-lg">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 