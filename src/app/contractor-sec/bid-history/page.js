"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useGovUser } from "@/Context/govUser";

const BidHistory = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useGovUser();

  const contractorId = user?.id;

  useEffect(() => {
    const fetchBidHistory = async () => {
      try {
        const response = await axios.post(
          "/api/contractor/bid-history",
          { contractorId }
        );
        setBids(response.data);
      } catch (error) {
        console.error("Error fetching bid history", error);
      } finally {
        setLoading(false);
      }
    };

    if (contractorId) {
      fetchBidHistory();
    }
  }, [contractorId]);

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      {/* Content */}
      <div className="relative max-w-6xl mx-auto p-4 md:p-6">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-center mb-10"
        >
          My Bid History
        </motion.h1>

        {loading ? (
          <p className="text-gray-400 text-center">
            Loading your bid history…
          </p>
        ) : bids.length === 0 ? (
          <p className="text-gray-400 text-center">
            You haven’t placed any bids yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bids.map((bid, idx) => (
              <motion.div
                key={bid._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -4 }}
                className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-gray-600 transition"
              >
                <h2 className="text-lg font-semibold mb-3">
                  {bid.tenderTitle}
                </h2>

                <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                  {bid.tenderDescription}
                </p>

                <div className="text-sm text-gray-300 space-y-1 mt-3">
                  <p>
                    <span className="text-gray-400">Bid Amount:</span>{" "}
                    ₹{bid.bidAmount}
                  </p>
                  <p>
                    <span className="text-gray-400">Experience:</span>{" "}
                    {bid.experience} yrs
                  </p>
                </div>

                <p className="text-gray-400 text-xs mt-4">
                  Submitted on{" "}
                  {new Date(bid.timestamp).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BidHistory;
