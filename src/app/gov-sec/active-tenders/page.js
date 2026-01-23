"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function TendersPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/tender/get-tender");

        setTenders(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Could not get tenders", error);
        setError("Could not get tenders");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-6"
        >
          Active Tenders
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <input
            type="text"
            placeholder="Search tenders by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition"
          />
        </motion.div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-[#14162d8a] backdrop-blur-xl md:p-6 p-3 rounded-2xl shadow-md animate-pulse border border-gray-800"
              >
                <div className="h-6 bg-gray-700 rounded-lg w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded-lg w-1/2"></div>
                <div className="mt-4 h-10 bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : tenders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenders
              .filter((item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md transition border border-gray-800 hover:border-gray-600"
              >
                <h2 className="text-xl font-semibold">
                  {item.title}
                </h2>
                <p className="text-gray-300 mt-2">Tender ID: {item._id}</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    router.push(
                      `/gov-sec/bid-auth?tender=${encodeURIComponent(
                        JSON.stringify(item)
                      )}`
                    )
                  }
                  className="mt-4 bg-white text-black px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  View Details
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="my-5 justify-self-center text-xl text-gray-300">
            No Active Tenders
          </div>
        )}
      </div>
    </div>
  );
}
