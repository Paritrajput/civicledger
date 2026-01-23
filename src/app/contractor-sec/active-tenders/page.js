"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function TendersPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/tender/get-tender");
        setTenders(response.data);
      } catch (err) {
        console.error("Could not get tenders", err);
        setError("Could not get tenders");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto p-4 md:p-6">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-8 text-center"
        >
          Active Tenders
        </motion.h1>

        {error && (
          <p className="text-red-400 text-center mb-6">{error}</p>
        )}

        <div className="space-y-5">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : tenders.map((item, index) => (
                <TenderCard
                  key={index}
                  title={item.title}
                  description={item.description}
                  deadline={new Date(
                    item.bidClosingDate
                  ).toLocaleString()}
                  onClick={() =>
                    router.push(
                      `/contractor-sec/tender-desc?tender=${encodeURIComponent(
                        JSON.stringify(item)
                      )}`
                    )
                  }
                />
              ))}
        </div>
      </div>
    </div>
  );
}



function TenderCard({ title, description, deadline, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg cursor-pointer border border-gray-800 hover:border-gray-600 transition"
    >
      <h2 className="text-lg font-semibold">{title}</h2>

      <p className="text-gray-300 mt-2 line-clamp-2">
        {description}
      </p>

      <div className="flex flex-wrap gap-2 mt-4 text-sm">
        <span className="text-gray-400">Bidding deadline:</span>
        <span className="text-white font-medium">{deadline}</span>
      </div>
    </motion.div>
  );
}



function SkeletonCard() {
  return (
    <div className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-800 animate-pulse">
      <div className="h-5 bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-700 rounded w-2/3 mb-4" />
      <div className="h-4 bg-gray-700 rounded w-1/3" />
    </div>
  );
}
