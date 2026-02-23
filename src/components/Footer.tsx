"use client"
import React from "react";
import Link from "next/link";
import { Github } from "lucide-react";
const Footer = () => (
  <footer className="relative bg-black text-white pt-24 pb-12 overflow-hidden border-t border-white/10 font-[var(--font-inter)]">
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
        {/* Column 1: Brand & Social (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <Link href="/" className="inline-block">
            <span className="font-bold text-2xl tracking-tight text-white">
              Jukebox<span className="text-red-500 ml-1">Duo</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Experience music together, no matter the distance.
            Synchronized listening for friends, couples, and music lovers worldwide.
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="https://x.com/ashwanivermax" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </Link>
            <Link href="https://ashwaniv.me" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            </Link>
            <Link href="https://github.com/ashwaniverma-github/Jukebox-Duo-Websocket" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-gray-400 hover:text-white">
              <Github />
            </Link>
          </div>
        </div>

        {/* Column 2: Product & Tools (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div>
            <h3 className="font-semibold text-white tracking-wide mb-6">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white tracking-wide mb-6">Tools</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools/playlist-name-generator" className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                  Playlist Name Generator
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Column 3: Listen Together (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <h3 className="font-semibold text-white tracking-wide">Listen Together</h3>
          <ul className="space-y-2">
            {[
              'taylor-swift', 'ed-sheeran', 'the-weeknd', 'drake', 'ariana-grande', 'bts',
              'lo-fi-beats', 'study-music', 'workout-playlist', 'chill-vibes'
            ].slice(0, 8).map((slug) => (
              <li key={slug}>
                <Link href={`/listen-together/${slug}`} className="text-sm text-gray-500 hover:text-white transition-colors capitalize block py-0.5">
                  {slug.replace(/-/g, ' ')}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/listen-together" className="text-sm text-red-500 hover:text-red-400 font-medium inline-flex items-center gap-1 mt-1 group">
                View All Categories
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Use Cases (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-semibold text-white tracking-wide">Use Cases</h3>
          <ul className="space-y-2">
            {[
              'long-distance-couples', 'best-friends', 'study-sessions',
              'workout-buddies', 'road-trips', 'virtual-parties',
              'movie-nights', 'family'
            ].slice(0, 6).map((slug) => (
              <li key={slug}>
                <Link href={`/for/${slug}`} className="text-sm text-gray-500 hover:text-white transition-colors block py-0.5">
                  For {slug.replace(/-/g, ' ')}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 5: Alternatives (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-semibold text-white tracking-wide">Alternatives</h3>
          <ul className="space-y-2">
            {[
              'spotify', 'youtube-music'
            ].map((slug) => (
              <li key={slug}>
                <Link href={`/alternatives/${slug}`} className="text-sm text-gray-500 hover:text-white transition-colors capitalize block py-0.5">
                  {slug.replace(/-/g, ' ')} Alternative
                </Link>
              </li>
            ))}
            <li>
              <Link href="/alternatives" className="text-sm text-red-500 hover:text-red-400 font-medium inline-flex items-center gap-1 mt-1 group">
                View All
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 6: Solo Listeners (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-semibold text-white tracking-wide">Focus Mode</h3>
          <ul className="space-y-2">
            {[
              'study-sessions', 'deep-work', 'adhd-focus', 'solo-listening'
            ].map((slug) => (
              <li key={slug}>
                <Link href={`/focus/${slug}`} className="text-sm text-gray-500 hover:text-white transition-colors capitalize block py-0.5">
                  {slug.replace(/-/g, ' ')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} JukeboxDuo. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="text-xs text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-xs text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;