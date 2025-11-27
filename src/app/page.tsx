"use client"
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-red-500/30">
      {/* Global Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-40" />
      </div>

      <div className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTABanner />
        <Footer />
      </div>
    </div>
  );
}
