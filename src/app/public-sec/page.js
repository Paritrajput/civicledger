"use client";

import { useState } from "react";
import Page1 from "@/Components/People/page1";
import Page2 from "@/Components/People/page2";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const PublicSec = () => {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const routes = [
    { key: "Issues", title: "Issues", icon: "📄" },
    { key: "Contracts", title: "Contracts", icon: "✍️" },
  ];

  const renderScene = () => {
    switch (index) {
      case 0:
        return <Page1 />;
      case 1:
        return <Page2 />;

      default:
        return <Page1 />;
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* FIXED BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      {/* NAVBAR */}
      <div className="flex justify-between items-center p-4 bg-[#14162d8a]/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl font-semibold"
        >
          Public Corner
        </motion.div>
        <div className="flex gap-8">
          {routes.map((route, i) => (
            <motion.button
              key={route.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center p-2 transition-all duration-300 rounded-lg ${
                index === i
                  ? "text-white bg-[#1a1d3a]"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setIndex(i)}
            >
              <span className="text-sm font-medium">{route.title}</span>
            </motion.button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/public-sec/public-issue")}
          className="bg-white text-black px-4 py-2 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transition"
        >
          +
        </motion.button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="relative">{renderScene()}</div>
    </div>
  );
};

export default PublicSec;
