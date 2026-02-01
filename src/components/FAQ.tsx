"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

const faqs = [
    {
        question: "What is Jukebox Duo?",
        answer: "Jukebox Duo is a synchronized music listening platform that allows you to listen to music with friends or partners in real-time, no matter where you are. Shared rooms, shared control, perfect sync."
    },
    {
        question: "Is Jukebox Duo really free?",
        answer: "Yes! Our core synchronized listening features are free and ad-free for everyone. We offer a premium lifetime deal for users who want extra customization and features like premium badges and more."
    },
    {
        question: "Do my friends need a paid subscription to join?",
        answer: "No! Unlike other platforms, your friends don't need to pay for a premium subscription to join your room and listen together. It's completely free for all participants."
    },
    {
        question: "How do I invite someone to my room?",
        answer: "Simply create a room and copy the unique invite link from the header. Share it with your friends via WhatsApp, Discord, or any other messaging app, and they can join instantly."
    },
    {
        question: "Does it support YouTube Music playlists?",
        answer: "Yes! We support bulk YouTube Music playlist imports. You can easily move your library over and enjoy your favorite tracks ad-free with your crew."
    },
    {
        question: "Is there a mobile app?",
        answer: "Jukebox Duo is a Progressive Web App (PWA) optimized for mobile. You can add it to your home screen for an app-like experience on both iOS and Android without needing to download anything from an app store."
    }
];

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => {
    return (
        <div className="border-b border-white/5 last:border-0">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between py-6 text-left group transition-all"
            >
                <span className={`text-lg md:text-xl font-medium transition-colors ${isOpen ? 'text-rose-500' : 'text-zinc-300 group-hover:text-white'}`}>
                    {question}
                </span>
                <div className={`flex-shrink-0 ml-4 p-2 rounded-full bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-rose-500/10 text-rose-500' : 'text-zinc-500'}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-zinc-400 leading-relaxed max-w-3xl">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 relative overflow-hidden" id="faq">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16">
                    <div className="lg:w-1/3">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                Got <span className="text-rose-500">questions?</span> <br />
                                We&apos;ve got answers.
                            </h2>
                            <p className="text-zinc-400 text-lg mb-8">
                                Everything you need to know about Jukebox Duo and how it works.
                            </p>
                            <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10">
                                <p className="text-sm font-medium text-rose-300 mb-2">Still need help?</p>
                                <p className="text-sm text-zinc-500 mb-4">Can&apos;t find what you&apos;re looking for? Reach out to our team.</p>
                                <Link href="/contact" className="text-sm font-bold text-white hover:text-rose-400 transition-colors flex items-center gap-2">
                                    Contact Support <Plus className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:w-2/3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-[3rem] p-8 md:p-12"
                        >
                            {faqs.map((faq, index) => (
                                <FAQItem
                                    key={index}
                                    question={faq.question}
                                    answer={faq.answer}
                                    isOpen={openIndex === index}
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
