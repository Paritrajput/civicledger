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
      } catch (error) {
        console.error("Could not get tenders", error);
        setError("Could not get tenders");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN");

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

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition"
          />
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : tenders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenders
              .filter(
                (t) =>
                  t.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  t.category
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )
              .map((tender, index) => (
                <motion.div
                  key={tender._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold">
                      {tender.title}
                    </h2>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        tender.status === "OPEN"
                          ? "bg-green-500 text-black"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {tender.status}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      <span className="text-gray-400">Category:</span>{" "}
                      {tender.category || "—"}
                    </p>
                    <p>
                      <span className="text-gray-400">Location:</span>{" "}
                      {tender.location?.placeName || "—"}
                    </p>
                    <p>
                      <span className="text-gray-400">Bid Window:</span>{" "}
                      {formatDate(tender.bidOpeningDate)} →{" "}
                      {formatDate(tender.bidClosingDate)}
                    </p>
                    <p>
                      <span className="text-gray-400">Budget:</span>{" "}
                      ₹{tender.minBidAmount} – ₹{tender.maxBidAmount}
                    </p>
    
                    <p>
                      <span className="text-gray-400">Documents:</span>{" "}
                      {tender.attachments?.length || 0}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      router.push(
                        `/gov-sec/bid-auth?tender=${encodeURIComponent(
                          JSON.stringify(tender)
                        )}`
                      )
                    }
                    className="mt-4 w-full bg-white text-black py-2 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    View Details
                  </motion.button>
                </motion.div>
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-300 text-lg">
            No Active Tenders
          </div>
        )}
      </div>
    </div>
  );
}
