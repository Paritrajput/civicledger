"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const submitTender = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const fd = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value);
      });

      if (parsedIssue?._id) {
        fd.append("issueId", parsedIssue._id);
      }

      documents.forEach((file) => {
        fd.append("documents", file);
      });

      const res = await fetch("/api/tender/create-tender", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tender creation failed");

      alert("Tender created successfully");

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
      setDocuments([]);
    } catch (err) {
      console.error("❌ Tender Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!parsedIssue) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
        <p className="text-red-500 text-lg">Issue details not found</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative md:p-6 p-3 max-w-3xl mx-auto">

        {/* ISSUE DETAILS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg mb-8 border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-4">Issue Details</h2>

          <p className="text-gray-300">
            <strong className="text-white">Type:</strong>{" "}
            {parsedIssue.issue_type}
          </p>

          <p className="text-gray-300 mt-2">
            <strong className="text-white">Description:</strong>{" "}
            {parsedIssue.description}
          </p>

          <p className="text-gray-300 mt-2">
            <strong className="text-white">Location:</strong>{" "}
            {parsedIssue.location?.placeName}
          </p>

 {parsedIssue.images?.length > 0 && (
          <div className="mt-4">
            <img
              src={parsedIssue.images[activeImage]}
              className="rounded-lg w-full"
            />
            <div className="flex gap-2 mt-2">
              {parsedIssue.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-20 cursor-pointer border ${
                    i === activeImage ? "border-white" : "border-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
  
        </motion.div>

        {/* TENDER FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-6">Enter Tender Details</h2>

          <div className="grid gap-4">
            {[
              { label: "Tender Title", name: "title", type: "text" },
              { label: "Description", name: "description", type: "textarea" },
              { label: "Category", name: "category", type: "text" },
              { label: "Min Bid Amount", name: "minBidAmount", type: "number" },
              { label: "Max Bid Amount", name: "maxBidAmount", type: "number" },
              { label: "Bid Opening Date", name: "bidOpeningDate", type: "date" },
              { label: "Bid Closing Date", name: "bidClosingDate", type: "date" },
              { label: "Work Location", name: "location", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-gray-300 font-semibold mb-2">
                  {label}
                </label>
                {type === "textarea" ? (
                  <textarea
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full bg-[#0f1224] border border-gray-700 p-3 rounded-xl text-white"
                    required
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full bg-[#0f1224] border border-gray-700 p-3 rounded-xl text-white"
                    required
                  />
                )}
              </div>
            ))}

            {/* ATTACH DOCUMENTS */}
            <div>
              <label className="block text-gray-300 font-semibold mb-2">
                Attach Documents (PDF / DOC)
              </label>
              <input
                type="file"
                multiple
                onChange={handleDocumentChange}
                className="w-full bg-[#0f1224] border border-gray-700 p-3 rounded-xl
                text-gray-300 file:bg-white file:text-black
                file:px-3 file:py-1 file:rounded-lg file:border-0"
              />
              {documents.length > 0 && (
                <div className="mt-2 text-sm text-gray-400">
                  {documents.map((f, i) => (
                    <p key={i}>📄 {f.name}</p>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-red-400">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={submitTender}
              disabled={loading}
              className="bg-white text-black p-3 rounded-xl font-bold mt-4"
            >
              {loading ? "Creating Tender..." : "Submit Tender"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};



 // try {
    //   if (typeof window.ethereum === "undefined") {
    //     throw new Error("Metamask is not installed.");
    //   }

    //   const TenderABI = Tender.abi;
    //   await window.ethereum.request({ method: "eth_requestAccounts" });

    //   const provider = new BrowserProvider(window.ethereum);
    //   const signer = await provider.getSigner();
    //   const contract = new Contract(contractAddress, TenderABI, signer);

    //   const deadline = Math.floor(
    //     new Date(formData.bidClosingDate).getTime() / 1000,
    //   );
    //   const starting = Math.floor(
    //     new Date(formData.bidOpeningDate).getTime() / 1000,
    //   );

    //   const tx = await contract.createTender(
    //     formData.title,
    //     formData.description,
    //     formData.category,
    //     formData.minBidAmount,
    //     formData.maxBidAmount,
    //     starting,
    //     deadline,
    //     formData.location,
    //     creator?.id,
    //   );

    //   await tx.wait();
    //   console.log(" Tender successfully created on Blockchain");

    //   // const receipt = await tx.wait();
    //   // console.log(receipt)

    //   // // const transactionHash = receipt.transactionHash;
    //   // let tempTenderId = "";

    //   // for (const log of receipt.logs) {
    //   //   try {
    //   //     const parsedLog = contract.interface.parseLog(log);
    //   //     if (parsedLog.name === "TenderCreated") {
    //   //       tempTenderId = parsedLog.args[0].toString();
    //   //       break;
    //   //     }
    //   //   } catch (error) {
    //   //     continue;
    //   //   }
    //   // }

    //   // if (!tempTenderId) {
    //   //   throw new Error("Tender ID not found in blockchain event logs");
    //   // }

    //   // console.log(tempTenderId)

    //   // setBlockchainTenderId(tempTenderId);