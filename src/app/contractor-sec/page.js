"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useGovUser } from "@/Context/govUser";
import { useRouter } from "next/navigation";

export default function ContractorHomePage() {
  const router = useRouter();
  const { user, setUser } = useGovUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <main className="relative min-h-screen text-white">
    
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <section className="px-6 md:px-20 pt-20 pb-14 text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold"
        >
          Contractor Dashboard
        </motion.h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Manage tenders, track contracts, and monitor progress in one unified
          workspace.
        </p>

        <div className="flex justify-center flex-wrap gap-4 pt-6">
          {!user ? (
            <Link href="/contractor-login">
              <button className="bg-white text-black font-semibold px-4 py-2 rounded-2xl hover:bg-gray-200 transition">
                Login
              </button>
            </Link>
          ) : (
            <div className="flex gap-4 max-md:flex-col items-center">
              <div className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 px-4 py-2 rounded-xl flex items-center gap-2">
                Welcome, {user.name}
              </div>

              <button
                className="bg-white text-black px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 md:px-20 pb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Contractor Tools
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="View Active Tenders"
            desc="Browse government tenders and participate in bidding."
            href="/contractor-sec/active-tenders"
          />
          <FeatureCard
            title="My Bids"
            desc="Review your bidding history and track bid statuses."
            href="/contractor-sec/bid-history"
          />
          <FeatureCard
            title="My Contracts"
            desc="Track progress, milestones, and payments for awarded contracts."
            href="/contractor-sec/my-contracts"
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc, href }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-[#14162d8a] backdrop-blur-xl rounded-2xl p-6 shadow-lg flex flex-col justify-between border border-gray-800 hover:border-gray-600 transition"
    >
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 mb-5">{desc}</p>
      </div>

      <Link href={href}>
        <span className="bg-white text-black px-4 py-2 rounded-2xl font-medium inline-flex items-center gap-2 hover:bg-gray-200 transition">
          Go to
          <ArrowRight size={18} />
        </span>
      </Link>
    </motion.div>
  );
}
