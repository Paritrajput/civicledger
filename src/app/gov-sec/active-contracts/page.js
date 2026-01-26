"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

const milestoneBadge = {
  DRAFT: {
    label: "Needs Milestone Creation",
    color: "bg-red-500 text-white",
    cta: "Create Milestones",
  },
  CONTRACTOR_REVIEW: {
    label: "Waiting for Contractor",
    color: "bg-yellow-400 text-black",
    cta: "View Milestones",
  },
  CONTRACTOR_PROPOSED: {
    label: "Contractor Proposed Changes",
    color: "bg-orange-500 text-white",
    cta: "Review Proposal",
  },
  GOV_REVIEW: {
    label: "Gov Review Pending",
    color: "bg-purple-500 text-white",
    cta: "Review Milestones",
  },
  FINALIZED: {
    label: "Active Project",
    color: "bg-green-500 text-black",
    cta: "Monitor Project",
  },
};

export default function ContractsPage() {
  const router = useRouter();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get("/api/contracts/gov-contracts");
        setContracts(res.data);
      } catch (err) {
        console.error("Could not fetch contracts", err);
        setError("Could not load contracts");
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter((c) =>
    `${c.contractId}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-center mb-6"
        >
          Government Contracts
        </motion.h1>

        {/* Search */}
        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search by contract ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
          />
        </div>

        {error && <p className="text-red-400 text-center">{error}</p>}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center text-gray-400">
            No contracts found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContracts.map((contract, index) => {
              const remaining =
                (contract.contractValue || 0) -
                (contract.paidAmount || 0);

              const milestone =
                milestoneBadge[contract.milestonePlanStatus] || {};

              return (
                <motion.div
                  key={contract._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-semibold">
                      {contract.contractId}
                    </h2>

                    {milestone.label && (
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${milestone.color}`}
                      >
                        {milestone.label}
                      </span>
                    )}
                  </div>

                  {/* Financials */}
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Contract Value: ₹{contract.contractValue}</p>
                    <p>Paid: ₹{contract.paidAmount}</p>
                    <p>
                      Remaining:{" "}
                      <span className="font-medium">
                        ₹{remaining}
                      </span>
                    </p>
                  </div>

                  {/* Award Info */}
                  {contract.awardMeta && (
                    <p className="text-xs text-gray-400 mt-2">
                      Awarded via{" "}
                      <span className="font-medium">
                        {contract.awardMeta.selectionType === "SYSTEM"
                          ? "System Recommendation"
                          : "Manual Selection"}
                      </span>
                    </p>
                  )}

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      router.push(
                        `/gov-sec/payment-desc?contract=${encodeURIComponent(
                          JSON.stringify(contract)
                        )}`
                      )
                    }
                    className="mt-4 w-full bg-white text-black py-2 rounded-xl font-semibold hover:shadow-lg"
                  >
                    {milestone.cta || "Manage Contract"}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Skeleton ---------------- */

function SkeletonCard() {
  return (
    <div className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 animate-pulse">
      <div className="h-5 bg-gray-700 rounded w-2/3 mb-3" />
      <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-700 rounded w-full mb-2" />
      <div className="h-10 bg-gray-700 rounded mt-4" />
    </div>
  );
}
