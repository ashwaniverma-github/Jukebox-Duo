"use client"
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden selection:bg-rose-500/30">
      {/* Global Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 opacity-80" />
        <div className="absolute top-0 left-1/4 w-[1000px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[600px] bg-zinc-800/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTABanner />
        <Footer />
      </div>
    </div>
  );
}
