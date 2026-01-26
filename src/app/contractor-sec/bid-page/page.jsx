"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useNotification } from "@/Context/NotificationContext";

const BidForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const blockchainTenderId = searchParams.get("tenderId");
  const tenderId = searchParams.get("mongoId");

  const [bidAmount, setBidAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [remarks, setRemarks] = useState("");
  const [proposalFile, setProposalFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const {error, success, warning} = useNotification();
 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!proposalFile) {
      warning("Please upload proposal document");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        warning("Authentication required");
        return;
      }

      const formData = new FormData();
      formData.append("tenderId", tenderId);
      formData.append("blockchainTenderId", blockchainTenderId);
      formData.append("bidAmount", bidAmount);
      formData.append("timeline", timeline);
      formData.append("remarks", remarks);
      formData.append("proposal", proposalFile);

      const res = await fetch("/api/bidding", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        error(data.error || "Failed to place bid");
      }

      success("Bid placed successfully!");
      router.back();
    } catch (err) {
      console.error(err);
      error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
  
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative flex justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#14162d8a] backdrop-blur-xl rounded-2xl border border-gray-800 p-6 shadow-lg"
        >
          <h1 className="text-2xl font-bold text-center mb-6">
            Place Your Bid
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
        
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Bid Amount (₹)
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-gray-500"
              />
            </div>

          
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Estimated Completion Time
              </label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 6 months"
                required
                className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 rounded-xl text-white"
              />
            </div>

          
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Technical Approach / Notes
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Brief work approach, materials, team etc."
                className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 rounded-xl text-white"
              />
            </div>

       
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Proposal Document (PDF / DOC)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setProposalFile(e.target.files[0])}
                required
                className="w-full text-sm text-gray-400
                  file:bg-white file:text-black file:px-4 file:py-2
                  file:rounded-lg file:border-0 file:cursor-pointer"
              />
            </div>

       
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Bid"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BidForm;
