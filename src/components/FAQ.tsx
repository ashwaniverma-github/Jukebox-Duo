"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

const faqs = [
    {
        question: "What is Jukebox Duo?",
        answer: "Jukebox Duo is a premier synchronized music listening platform designed to bring people together regardless of physical distance. Whether you're in a long-distance relationship, hanging out with friends remotely, or hosting a virtual study session, our platform allows you to create private rooms where music is played in perfect synchronization across all connected devices. Everyone in the room hears the same beat at the same time, creating a shared auditory experience that feels just like sitting in the same room."
    },
    {
        question: "Is Jukebox Duo really free?",
        answer: "Yes, Jukebox Duo is committed to keeping social music listening accessible. One of our core features—including room playlist sharing, room creation, and YouTube integration—are entirely free and ad-free for everyone. We don't believe in charging a 'social tax' for you to enjoy music with your friends. For power users who want to support the project, we offer a low-cost lifetime premium deal that unlocks exclusive customization options, premium badges, and unique synchronized themes like our popular 'Love Theme'."
    },
    {
        question: "Do my friends need a paid subscription to join?",
        answer: "Absolutely not! This is one of the biggest advantages of Jukebox Duo over Spotify Jam. Unlike Spotify Jam which requires BOTH users to have a paid Spotify Premium subscription, Jukebox Duo only needs ONE person (the host) to have premium. We even offer an affordable lifetime deal so you never have to worry about recurring payments! Your friends can join instantly without any paid subscription or downloads. It runs entirely in your browser, so there's nothing to install or configure. They simply click your unique room link and start enjoying synchronized music together. No monthly fees for your friends, no app downloads, no barriers—just pure shared musical bliss that's truly accessible for everyone."
    },
    {
        question: "How do I invite someone to my room?",
        answer: "Inviting someone is as simple as sharing a link. Once you've created or joined a room, look for the 'Share' or 'Invite' icon in the header. Clicking this will copy a unique URL to your clipboard. You can then send this link via WhatsApp, Discord, Slack, Telegram, or any other messaging platform. When your friend clicks the link, they'll be brought directly into your synchronized session. If they're not signed in, they'll be prompted to do a quick Google sign-in to join the presence list."
    },
    {
        question: "Does it support YouTube Music playlists?",
        answer: "Yes! We have built a robust playlist import system that supports bulk importing from YouTube and YouTube Music. If you have a curated collection of songs or a favorite workout playlist, you can move it over to Jukebox Duo in seconds. Simply copy the playlist URL, paste it into our import tool, and we'll automatically add the tracks to your room's queue. This allows you to leverage your existing music library while enjoying the superior social features of our platform."
    },
    {
        question: "How does the synchronization work?",
        answer: "Our synchronization engine utilizes low-latency WebSocket communication to ensure that every client in a room is aware of the current playback state. When the host plays, pauses, or skips a track, the command is broadcasted to all other participants within milliseconds. We also implement periodic sync checks that account for minor network jitters, ensuring that even on varying connection speeds, everyone stays on the same beat. It's a professional-grade solution for the most demanding audiophiles."
    },
    {
        question: "Is my privacy protected on Jukebox Duo?",
        answer: "We take your privacy very seriously. Jukebox Duo uses secure Google OAuth for authentication, ensuring we never handle your passwords directly. Your listening rooms are private by default, and only those with the unique link can join. We don't sell your listening data to advertisers, and we don't track you across the web. Our goal is to provide a safe, respectful space for you and your friends to enjoy music together."
    },
    {
        question: "Is there a mobile app?",
        answer: "Jukebox Duo is built as a highly optimized Progressive Web App (PWA). This means you get a full, app-like experience on both iOS and Android without needing to download large files from an app store. You can easily add Jukebox Duo to your home screen by using the 'Add to Home Screen' option in your mobile browser. This provides you with a dedicated icon, full-screen playback, and faster load times, making it the perfect companion for mobile listening sessions."
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
