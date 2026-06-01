"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="min-h-screen text-white bg-[#04070f] overflow-hidden">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-purple-600 opacity-20 blur-[140px] rounded-full"></div>

      {/* HERO */}
      <section className="relative px-6 pt-28 pb-16 md:pt-32 md:pb-24 text-center">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold leading-snug tracking-tight"
          >
            Reinventing Public Infrastructure
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              With Transparency & Trust
            </span>
          </motion.h1>

          <p className="mt-6 text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            CivicLedger empowers governments, contractors, and citizens with
            blockchain-backed transparency, AI-powered verification, and real-time
            accountability.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                Get Started
                <ArrowRight size={18} />
              </button>
            </Link>

            <Link href="/public-sec" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border border-gray-600 px-6 py-3 rounded-2xl hover:bg-white hover:text-black transition">
                Explore Platform
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="px-6 pb-12 text-center">
        <p className="text-gray-500 text-xs sm:text-sm uppercase tracking-widest">
          Built for transparency • Designed for accountability • Powered by blockchain
        </p>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-12">
            A New Standard for Governance
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <Card
              title="Immutable Transparency"
              desc="All contracts, funds, and activities are recorded on blockchain, eliminating corruption and manipulation."
            />
            <Card
              title="AI Verification Engine"
              desc="Milestones are verified using intelligent image comparison with real-world data."
            />
            <Card
              title="Real-time Monitoring"
              desc="Track projects, funds, and contractor performance live with full public visibility."
            />
          </div>
        </div>
      </section>

      {/* VISUAL PANEL */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-purple-900/40 to-black rounded-3xl p-6 md:p-10 border border-gray-800 backdrop-blur-xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                Built for Modern Governance
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                CivicLedger integrates blockchain, AI, and real-time systems to
                ensure every public project is accountable, trackable, and verifiable
                from start to finish.
              </p>
            </div>

            {/* <div className="h-48 sm:h-64 bg-[#0f172a] rounded-2xl border border-gray-800 flex items-center justify-center text-gray-500 text-sm">
              System Visualization
            </div> */}
            <div className="h-56 sm:h-64 bg-[#0f172a] rounded-2xl border border-gray-800 p-4 flex flex-col gap-3">
  
  <div className="flex justify-between items-center">
    <div className="text-xs text-gray-400">Active Tender</div>
    <div className="text-green-400 text-xs">Live</div>
  </div>

  <div className="bg-[#1e293b] p-3 rounded-lg">
    <div className="text-sm font-semibold">Road Construction - Phase 2</div>
    <div className="text-xs text-gray-400 mt-1">Progress: 68%</div>

    <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
      <div className="bg-purple-500 h-2 rounded-full w-[68%]"></div>
    </div>
  </div>

  <div className="flex justify-between text-xs text-gray-400">
    <span>Funds Released</span>
    <span>₹12.4L</span>
  </div>

  <div className="text-xs text-purple-400">
    AI Verification: Completed ✅
  </div>
</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-16 md:py-20 text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-12">
            How CivicLedger Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <Step step="01" title="Tender Creation" desc="Government publishes transparent tenders." />
            <Step step="02" title="Smart Bidding" desc="Contractors compete fairly with traceable bids." />
            <Step step="03" title="AI Verification" desc="Milestones verified before fund release." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-700 to-pink-600 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Experience Transparent Governance Today
          </h2>

          <Link href="/login">
            <button className="w-full sm:w-auto bg-white text-black px-8 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition">
              Join CivicLedger
            </button>
          </Link>
        </div>
      </section>


    </main>
  );
}

/* COMPONENTS */

function Card({ title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-[#111827] p-6 rounded-2xl border border-gray-800 hover:border-purple-500 transition"
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm sm:text-base">{desc}</p>
    </motion.div>
  );
}

function Step({ step, title, desc }) {
  return (
    <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
      <div className="text-purple-400 font-bold mb-2">{step}</div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm sm:text-base">{desc}</p>
    </div>
  );
}