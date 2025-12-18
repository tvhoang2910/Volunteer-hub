// pages/index.js
import React from "react";
import Hero from "../components/landing/hero";
import Destination from "../components/landing/destination";
import PendingEvents from "../components/landing/PendingEvents";
import About from "../components/landing/about";
import Review from "../components/landing/review";
import Benefit from "../components/landing/benefit";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import LogoCloud from "../components/landing/logoCloud";
import Feature17 from "../components/landing/Feature";
import Stat from "../components/landing/Stat";

function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Gradient background overlay với animation */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 opacity-30"></div>
      <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-green-100/20 via-blue-100/20 to-purple-100/20 animate-pulse"></div>

      {/* Animated gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full blur-3xl animate-blob -z-10"></div>
      <div className="fixed top-1/2 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-400/30 to-cyan-500/30 rounded-full blur-3xl animate-blob animation-delay-2000 -z-10"></div>
      <div className="fixed bottom-0 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full blur-3xl animate-blob animation-delay-4000 -z-10"></div>

      {/* Hero Section với gradient transition */}
      <div className="relative">
        <Hero />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/80 to-white pointer-events-none"></div>
      </div>

      {/* Destination Section với gradient wrapper */}
      <div className="relative bg-gradient-to-b from-white via-emerald-50/50 to-white py-8">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-teal-500/5"></div>
        <div className="relative">
          <Destination />
        </div>
      </div>

      {/* Pending Events Section - Sự kiện đang chờ duyệt */}
      <div className="relative bg-gradient-to-b from-white via-amber-50/30 to-white py-8">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-yellow-500/5"></div>
        <div className="relative">
          <PendingEvents />
        </div>
      </div>

      {/* About Section với gradient background */}
      <div className="relative bg-gradient-to-b from-white via-teal-50/30 to-cyan-50/40 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-400/10 via-transparent to-transparent"></div>
        <div className="relative">
          <LogoCloud />
        </div>
      </div>

      {/* Review Section với gradient overlay */}
      <div className="relative bg-gradient-to-b from-cyan-50/40 via-white to-emerald-50/50 py-8">
        <div className="absolute inset-0 bg-gradient-to-l from-purple-500/5 via-transparent to-green-500/5"></div>
        <div className="relative">
          <Stat />
        </div>
      </div>

      {/* Benefit Section với gradient finish */}
      <div className="relative bg-gradient-to-br from-emerald-50/50 via-white to-green-50 py-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(16,185,129,0.05)_0%,_rgba(5,150,105,0.05)_50%,_rgba(6,182,212,0.05)_100%)]"></div>
        <div className="relative">
          <Feature17 />
        </div>
        {/* Gradient fade to bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white to-white pointer-events-none"></div>
      </div>
    </div>
  );
}

export default Home;
