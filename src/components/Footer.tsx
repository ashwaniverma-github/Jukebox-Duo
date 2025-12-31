"use client"
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Footer = () => (
  <motion.footer
    className="bg-black/80 text-white py-8 px-4 text-center text-base mt-12 border-t border-white/10 opacity-[0.98] font-[var(--font-inter)]"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.7 }}
  >
    {/* Row with centered links and Contact Founder on right */}
    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mb-5 w-full relative">
      {/* Centered Navigation links */}
      <nav className="flex flex-wrap justify-center gap-4 md:gap-8 flex-1 md:absolute md:left-0 md:right-0 md:mx-auto w-full pointer-events-none">
        <div className="pointer-events-auto flex gap-4 md:gap-8 flex-wrap justify-center">
          <Link href="/features" className="text-white no-underline opacity-85 hover:opacity-100 transition-opacity">Features</Link>
          <Link href="/about" className="text-white no-underline opacity-85 hover:opacity-100 transition-opacity">About</Link>
          <Link href="/contact" className="text-white no-underline opacity-85 hover:opacity-100 transition-opacity">Contact</Link>
          <Link href="/terms" className="text-white no-underline opacity-85 hover:opacity-100 transition-opacity">Terms</Link>
          <Link href="/privacyPolicy" className="text-white no-underline opacity-85 hover:opacity-100 transition-opacity">Privacy Policy</Link>
        </div>
      </nav>

      {/* Spacer for mobile layout */}
      <div className="md:hidden w-full h-1"></div>

      {/* Contact Founder - Right aligned */}
      <div className="text-center md:text-left md:ml-auto z-10 relative md:pr-16">
        <div className=" mb-1 opacity-95">Contact Founder</div>
        <div className="flex gap-4 items-center justify-center md:justify-start">
          <Link href="https://x.com/ashwanivermax" target="_blank" rel="noopener noreferrer" className="text-white no-underline opacity-85 hover:opacity-100 transition-opacity flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </Link>
          <Link href="https://www.ashwani.me" target="_blank" rel="noopener noreferrer" className="text-white no-underline opacity-85 hover:opacity-100 transition-opacity flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            Website
          </Link>
        </div>
      </div>
    </div>
    <div className="text-white opacity-70 text-[0.95rem]">
      © 2025 JukeboxDuo.
    </div>
  </motion.footer>
);

export default Footer;