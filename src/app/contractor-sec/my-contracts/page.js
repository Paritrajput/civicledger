"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ContractsPage() {
  const router = useRouter();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized");
      setLoading(false);
      return;
    }

    const fetchContracts = async () => {
      try {
        const res = await axios.get("/api/contracts/contractor-contracts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContracts(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load contracts");
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-5xl mx-auto p-4 md:p-6">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-center mb-8"
        >
          Your Contracts
        </motion.h1>

        {loading ? (
          <SkeletonCards />
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : contracts.length === 0 ? (
          <p className="text-gray-400 text-center">
            No contracts assigned yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contracts.map((contract) => (
              <ContractCard
                key={contract._id}
                contract={contract}
                onClick={() =>
               router.push(`/contractor-sec/contract-desc?contractId=${contract._id}`)

                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Contract Card ---------------- */

function ContractCard({ contract, onClick }) {
  const milestoneStatusLabel = (() => {
    switch (contract.milestonePlanStatus) {
      case "DRAFT":
        return { text: "Milestones not created yet", color: "text-yellow-400" };
      case "CONTRACTOR_REVIEW":
        return { text: "Action required: Review milestones", color: "text-orange-400" };
      case "CONTRACTOR_PROPOSED":
        return { text: "Waiting for government review", color: "text-blue-400" };
      case "GOV_REVIEW":
        return { text: "Government reviewing changes", color: "text-blue-400" };
      case "FINALIZED":
        return { text: "Project Active", color: "text-green-400" };
      default:
        return { text: "—", color: "text-gray-400" };
    }
  })();

  const remaining =
    (contract.contractValue || 0) - (contract.paidAmount || 0);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg cursor-pointer border border-gray-800 hover:border-gray-600 transition"
    >
      <h2 className="text-lg font-semibold mb-1">
        Contract ID: {contract.contractId}
      </h2>

      <div className="text-sm text-gray-300 space-y-1 mt-2">
        <p>Contract Value: ₹{contract.contractValue}</p>
        <p>Paid: ₹{contract.paidAmount}</p>
        <p>
          Remaining:{" "}
          <span className="font-medium">₹{remaining}</span>
        </p>
      </div>

      <p className={`mt-3 text-sm font-semibold ${milestoneStatusLabel.color}`}>
        {milestoneStatusLabel.text}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        Status: {contract.status}
      </p>

      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 w-full bg-white text-black py-2 rounded-xl font-semibold text-center"
      >
        View Contract
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Skeleton ---------------- */

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-[#14162d8a] backdrop-blur-xl animate-pulse p-6 rounded-2xl border border-gray-800"
        >
          <div className="h-5 bg-gray-700 rounded w-2/3 mb-3" />
          <div className="h-4 bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-10 bg-gray-700 rounded mt-4" />
        </div>
      ))}
    </div>
  );
}
