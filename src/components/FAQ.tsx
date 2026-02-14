"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

const faqs = [
    {
        question: "What is Jukebox Duo?",
        answer: "A platform that lets you listen to music in perfect sync with friends in real-time. Create a private room, invite anyone, and hear the same beat at the same time — no matter the distance."
    },
    {
        question: "Is it free?",
        answer: "Yes! Room creation, playlist sharing, and YouTube integration are completely free and ad-free. We also offer a low-cost lifetime premium for extras like custom themes and badges."
    },
    {
        question: "Do my friends need to pay?",
        answer: "No. Unlike Spotify Jam which requires everyone to have Premium, only the host needs a premium on Jukebox Duo. Friends just click the room link — no downloads, no fees."
    },
    {
        question: "How do I invite someone?",
        answer: "Hit the Share icon in your room to copy a unique link. Send it via WhatsApp, Discord, or any messenger — your friend clicks it and joins instantly."
    },
    {
        question: "Can I import playlists?",
        answer: "Yes! Paste any YouTube or YouTube Music playlist URL into our import tool and all tracks are added to your room queue in seconds."
    },
    {
        question: "How does sync work?",
        answer: "We use low-latency WebSockets to broadcast play, pause, and skip actions to all participants within milliseconds, with periodic checks to keep everyone on the same beat."
    },
    {
        question: "Is my data private?",
        answer: "Absolutely. We use Google OAuth so we never touch your passwords. Rooms are private by default, and we never sell your data or track you across the web."
    },
    {
        question: "Is there a mobile app?",
        answer: "Jukebox Duo is a Progressive Web App — just tap 'Add to Home Screen' in your browser for a full app-like experience on iOS and Android, no app store needed."
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
