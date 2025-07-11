"use client"
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
