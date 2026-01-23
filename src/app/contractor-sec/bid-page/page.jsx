"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BidForm = () => {
  const [bidAmount, setBidAmount] = useState("");
  const [proposalDocument, setProposalDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const [contractorId, setContractorId] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const blockchainTenderId = searchParams.get("tenderId");
  const tenderId = searchParams.get("mongoId");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("/api/contractor/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setContractorId(res.data._id))
      .catch(() => localStorage.removeItem("token"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/bidding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockchainTenderId,
          tenderId,
          contractorId,
          bidAmount,
          proposalDocument,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Bid placed successfully!");
        router.back();
      } else {
        alert(data.error || "Failed to place bid");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while submitting the bid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      {/* Content */}
      <div className="relative flex justify-center items-start p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#14162d8a] backdrop-blur-xl rounded-2xl border border-gray-800 p-6 shadow-lg"
        >
          <h1 className="text-2xl font-bold text-center mb-6">
            Bidding Portal
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bid Amount */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Bid Amount
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                required
                className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Proposal Document */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Proposal Document Link
              </label>
              <input
                type="text"
                value={proposalDocument}
                onChange={(e) => setProposalDocument(e.target.value)}
                placeholder="Enter proposal document URL"
                required
                className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Place Bid"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BidForm;
