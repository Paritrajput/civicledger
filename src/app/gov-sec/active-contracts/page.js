"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function ContractsPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/contracts/gov-contracts");
        setTenders(response.data);
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
          className="md:text-3xl text-2xl font-bold text-center mb-6"
        >
          Your Contracts
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <input
            type="text"
            placeholder="Search contracts by ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition"
          />
        </motion.div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md animate-pulse border border-gray-800"
                >
                  <div className="h-6 bg-gray-700 rounded-lg w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded-lg w-1/2 mb-2"></div>
                  <div className="h-10 bg-gray-700 rounded-lg mt-4"></div>
                </div>
              ))
            : tenders
                .filter((item) =>
                  item.contractId
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
                .map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-[#14162d8a] backdrop-blur-xl md:p-6 p-3 rounded-2xl shadow-md border border-gray-800 hover:border-gray-600 transition"
                  >
                    <h2 className="text-xl font-semibold">{item.contractId}</h2>
                    <p className="text-gray-300 md:mt-3 mt-2">
                      Bid Amount: {item.bidAmount}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        router.push(
                          `/gov-sec/payment-desc?contract=${encodeURIComponent(
                            JSON.stringify(item),
                          )}`,
                        )
                      }
                      className="md:mt-4 mt-3 bg-white text-black px-5 py-2 rounded-xl font-semibold hover:shadow-lg transition"
                    >
                      View Details
                    </motion.button>
                  </motion.div>
                ))}
        </div>
      </div>
    </div>
  );
}
