import React from "react";
import { motion } from "framer-motion";
import { Zap, ListMusic, Globe, Github } from "lucide-react";

const features = [
  {
    title: "Real-Time Sync",
    desc: "Experience music together with zero latency. When you hit play, it plays for everyone instantly.",
    icon: <Zap className="w-6 h-6 text-red-500" />,
    gradient: "from-red-500/20 to-orange-500/20",
  },
  {
    title: "Collaborative Queue",
    desc: "Build the perfect playlist together. Add, remove, and reorder tracks in real-time.",
    icon: <ListMusic className="w-6 h-6 text-blue-500" />,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "No Downloads Required",
    desc: "Jump straight into the action. Runs entirely in your browser with no software to install.",
    icon: <Globe className="w-6 h-6 text-green-500" />,
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Open Source",
    desc: "Transparent and community-driven. Powered by YouTube and built with modern web tech.",
    icon: <Github className="w-6 h-6 text-purple-500" />,
    gradient: "from-purple-500/20 to-pink-500/20",
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
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Everything you need to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              vibe together.
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Simple, powerful features designed to make listening together seamless and fun.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
              />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
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