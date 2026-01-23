"use client";

import Link from "next/link";
// import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useGovUser } from "@/Context/govUser";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { user } = useGovUser();
  console.log(user);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  return (
    <main className="min-h-screen bg-gray-900/50 text-white">
      <section className="px-6 md:px-20 pt-20 pb-10 text-center space-y-6 bg-linear-to-t from-[#22043e] to-[#04070f]">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold leading-tight"
        >
          Welcome to CivicLedger
        </motion.h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Revolutionizing public infrastructure through transparency and
          blockchain.
        </p>

        <div className="flex justify-center flex-wrap gap-4 pt-6">
          {!user ? (
            <Link href="/login" className="flex gap-3">
              <button className="bg-white text-black hover:bg-gray-200 font-semibold px-3 py-2 rounded-2xl flex gap-1 items-center">
                Login
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition"
                  size={18}
                />
              </button>
            </Link>
          ) : (
            <div className=" flex gap-3">
              <button
                className="bg-white px-3 py-3 text-black rounded-xl  items-center cursor-default flex gap-1"
                onClick={handleLogout}
              >
                Logout{" "}
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition"
                  size={18}
                />
              </button>
            </div>
          )}

          {/* <Link href="/contractor-login">
            <button variant="outline" className="border-white text-white hover:bg-white hover:text-black font-semibold">
              Login as Contractor
            </button>
          </Link> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 md:px-20 py-7 pb-24 bg-linear-to-t from-[#04070f] to-[#22043e] text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          Explore Public Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature: View Issues */}
          <FeatureCard
            title="View Reported Issues"
            desc="Browse public issues raised by citizens with full transparency."
            href="/public-sec/current-issues"
          />
          {/* Feature: Upload Issue */}
          <FeatureCard
            title="Upload New Issue"
            desc="Report a problem in your locality with image and location."
            href="/public-sec/public-issue"
            
          />
          {/* Feature: Active Contracts */}
          <FeatureCard
            title="Active Contracts"
            desc="Track ongoing public contracts and monitor progress live."
            href="/public-sec/current-contract"
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc, href }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-[#14162d8a] rounded-2xl p-6 shadow-lg flex flex-col justify-between border border-gray-800"
    >
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{desc}</p>
      </div>
      <Link href={href}>
        <span className="text-black  bg-white px-3 py-2 rounded-2xl font-medium inline-flex items-center group">
          Explore{" "}
          <ArrowRight
            className="ml-2 group-hover:translate-x-1 transition"
            size={18}
          />
        </span>
      </Link>
    </motion.div>
  );
}
