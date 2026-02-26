import React from "react";
import { motion } from "framer-motion";
import { Laptop, Heart, PartyPopper } from "lucide-react";

const useCases = [
    {
        icon: <Laptop className="w-8 h-8" />,
        title: "Focus & Deep Work",
        description:
            "Open a tab, queue your favorites, and get in the zone. Jukebox Duo runs in the background while you work.",
        gradient: "from-amber-500 to-orange-600",
        bgGlow: "bg-amber-500/20",
    },
    {
        icon: <Heart className="w-8 h-8" />,
        title: "Long-Distance Listening",
        description:
            "Create a room and listen to the same song at the same time with someone across the world.",
        gradient: "from-rose-500 to-pink-600",
        bgGlow: "bg-rose-500/20",
    },
    {
        icon: <PartyPopper className="w-8 h-8" />,
        title: "Virtual Hangouts",
        description:
            "Everyone adds tracks, everyone hears them together. No more screen-sharing your Spotify.",
        gradient: "from-violet-500 to-purple-600",
        bgGlow: "bg-violet-500/20",
    },
];

const UseCases = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
                        Built for how
                        <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                            you actually listen.
                        </span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
                        Whether you&#39;re heads-down coding or catching up with friends,
                        <br className="hidden md:block" />
                        there&#39;s a room for that.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {useCases.map((useCase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="group relative rounded-[2.5rem] overflow-hidden"
                        >
                            {/* Background glow */}
                            <div
                                className={`absolute inset-0 ${useCase.bgGlow} blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700`}
                            />

                            <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-10 h-full group-hover:border-white/10 transition-all duration-500">
                                {/* Icon */}
                                <div
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-8 text-white shadow-xl group-hover:scale-110 transition-transform duration-500`}
                                >
                                    {useCase.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                                    {useCase.title}
                                </h3>
                                <p className="text-zinc-400 leading-relaxed font-light text-lg">
                                    {useCase.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UseCases;
