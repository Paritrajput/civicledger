"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [contractorId, setContractorId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }

    axios
      .get("/api/contractor/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setContractorId(res.data._id))
      .catch(() => {
        localStorage.removeItem("token");
        setError("Failed to fetch contractor profile");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!contractorId) return;

    const fetchContracts = async () => {
      try {
        const response = await axios.get(
          `/api/contracts/${contractorId}`
        );
        setContracts(response.data.contracts || []);
      } catch (err) {
        console.error(err);
        setError("Could not get contracts");
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [contractorId]);

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-4xl mx-auto p-4 md:p-6">
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
            No contracts found
          </p>
        ) : (
          <div className="space-y-5">
            {contracts.map((item) => (
              <ContractCard
                key={item.mongoContractId}
                contract={item}
                onClick={() =>
                  router.push(
                    `/contractor-sec/contract-desc?contract=${encodeURIComponent(
                      JSON.stringify(item)
                    )}`
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Contract Crd*/

function ContractCard({ contract, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg cursor-pointer border border-gray-800 hover:border-gray-600 transition"
    >
      <h2 className="text-lg md:text-xl font-semibold">
        Contract ID: {contract.mongoContractId}
      </h2>

      <p className="text-gray-300 mt-2">
        Bid Amount: ₹{contract.contractAmount}
      </p>

      <p
        className={`mt-2 font-medium ${
          contract.isCompleted
            ? "text-green-400"
            : "text-yellow-400"
        }`}
      >
        Status: {contract.isCompleted ? "Completed" : "Pending"}
      </p>
    </motion.div>
  );
}

/* Skeleton Loader */

function SkeletonCards() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#14162d8a] backdrop-blur-xl animate-pulse p-6 rounded-2xl border border-gray-800"
        >
          <div className="h-5 bg-gray-700 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-700 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}
