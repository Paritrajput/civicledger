"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BrowserProvider, Contract } from "ethers";
import Tender from "@/contracts/TenderCreation";
import { useGovUser } from "@/Context/govUser";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
      <MakeTender />
    </Suspense>
  );
}

export const MakeTender = () => {
  const searchParams = useSearchParams();
  const issueParam = searchParams.get("issue");
  const parsedIssue = issueParam
    ? JSON.parse(decodeURIComponent(issueParam))
    : null;

  const [creator, setCreator] = useState(null);
  const { user } = useGovUser();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    minBidAmount: "",
    maxBidAmount: "",
    bidOpeningDate: "",
    bidClosingDate: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // const [blockchainTenderId, setBlockchainTenderId] = useState("");

  useEffect(() => {
    setCreator(user);
  }, [user]);

  console.log(creator);

  const contractAddress = "0x65287e595750b26423761930F927e084B4175245";

  const submitTender = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Metamask is not installed.");
      }

      const TenderABI = Tender.abi;
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, TenderABI, signer);

      const deadline = Math.floor(
        new Date(formData.bidClosingDate).getTime() / 1000,
      );
      const starting = Math.floor(
        new Date(formData.bidOpeningDate).getTime() / 1000,
      );

      const tx = await contract.createTender(
        formData.title,
        formData.description,
        formData.category,
        formData.minBidAmount,
        formData.maxBidAmount,
        starting,
        deadline,
        formData.location,
        creator?.id,
      );

      await tx.wait();
      console.log("✅ Tender successfully created on Blockchain");

      // const receipt = await tx.wait();
      // console.log(receipt)

      // // const transactionHash = receipt.transactionHash;
      // let tempTenderId = "";

      // for (const log of receipt.logs) {
      //   try {
      //     const parsedLog = contract.interface.parseLog(log);
      //     if (parsedLog.name === "TenderCreated") {
      //       tempTenderId = parsedLog.args[0].toString();
      //       break;
      //     }
      //   } catch (error) {
      //     continue;
      //   }
      // }

      // if (!tempTenderId) {
      //   throw new Error("Tender ID not found in blockchain event logs");
      // }

      // console.log(tempTenderId)

      // setBlockchainTenderId(tempTenderId);

      // Store in MongoDB
      const mongoResponse = await fetch("/api/tender/create-tender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          issueDetails: parsedIssue,
          creator,
        }),
      });

      const mongoData = await mongoResponse.json();
      if (!mongoResponse.ok) {
        throw new Error(mongoData.error || "Failed to store in MongoDB");
      }

      setSuccess("Tender successfully created on MongoDB and Blockchain!");
      setFormData({
        title: "",
        description: "",
        category: "",
        minBidAmount: "",
        maxBidAmount: "",
        bidOpeningDate: "",
        bidClosingDate: "",
        location: "",
      });

      alert("tender created successfully");
    } catch (err) {
      console.error("❌ Error submitting tender:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!parsedIssue) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
        <p className="text-red-500 text-lg">Error: Issue details not found.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3 max-w-3xl mx-auto">
        {/* Issue Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg w-full mb-8 border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-4">Issue Details</h2>
          <div className="space-y-3">
            <p className="text-gray-300">
              <strong className="text-white">Type:</strong>{" "}
              {parsedIssue.issue_type}
            </p>
            <p className="text-gray-300">
              <strong className="text-white">Description:</strong>{" "}
              {parsedIssue.description}
            </p>
            <p className="text-gray-300">
              <strong className="text-white">Location:</strong>{" "}
              {parsedIssue.placename}
            </p>
          </div>
          {parsedIssue.image && (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={parsedIssue.image}
              alt="Issue"
              className="w-full h-48 object-cover mt-4 rounded-xl shadow-md"
            />
          )}
          <p className="text-gray-300 mt-4">
            <strong className="text-white">Date:</strong>{" "}
            {parsedIssue.date_of_complaint}
          </p>
        </motion.div>

        {/* Tender Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg w-full border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-6">Enter Tender Details</h2>

          <div className="grid gap-4">
            {[
              { label: "Tender Title", name: "title", type: "text" },
              {
                label: "Tender Description",
                name: "description",
                type: "textarea",
              },
              { label: "Category", name: "category", type: "text" },
              { label: "Min Bid Amount", name: "minBidAmount", type: "number" },
              { label: "Max Bid Amount", name: "maxBidAmount", type: "number" },
              {
                label: "Bid Opening Date",
                name: "bidOpeningDate",
                type: "date",
              },
              {
                label: "Bid Closing Date",
                name: "bidClosingDate",
                type: "date",
              },
              { label: "Work Location", name: "location", type: "text" },
            ].map(({ label, name, type }) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-2"
              >
                <label className="block font-semibold text-gray-300 mb-2">
                  {label}
                </label>
                {type === "textarea" ? (
                  <textarea
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-700 bg-[#0f1224] p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition"
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-700 bg-[#0f1224] p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition"
                  />
                )}
              </motion.div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              onClick={submitTender}
              className="bg-white text-black p-3 rounded-xl font-bold mt-6 hover:shadow-lg transition"
              disabled={loading}
            >
              {loading ? "Creating Tender..." : "Submit Tender"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
