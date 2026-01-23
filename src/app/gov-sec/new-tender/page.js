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
  // const searchParams = useSearchParams();
  // const issueParam = searchParams.get("issue");
  // const parsedIssue = issueParam
  //   ? JSON.parse(decodeURIComponent(issueParam))
  //   : null;

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

      // Store in MongoDB
      const mongoResponse = await fetch("/api/tender/create-tender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const [creator, setCreator] = useState(null);

  // const [formData, setFormData] = useState({
  //   title: "",
  //   description: "",
  //   category: "",
  //   minBidAmount: "",
  //   maxBidAmount: "",
  //   bidOpeningDate: "",
  //   bidClosingDate: "",
  //   location: "",
  // });

  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(null);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     axios
  //       .get("/api/gov-sec/profile", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       })
  //       .then((res) => setCreator(res.data))
  //       .catch(() => localStorage.removeItem("gov-token"));
  //   }
  // }, []);
  // console.log(creator);

  // const submitTender = async () => {
  //   setLoading(true);
  //   setError(null);
  //   setSuccess(null);

  //   try {
  //     const mongoResponse = await fetch("/api/tender/create-tender", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         ...formData,
  //         creator,
  //       }),
  //     });

  //     const mongoData = await mongoResponse.json();
  //     if (!mongoResponse.ok)
  //       throw new Error(mongoData.error || "Failed to store in MongoDB");

  //     setSuccess("Tender successfully created on MongoDB and Blockchain!");
  //     setFormData({
  //       title: "",
  //       description: "",
  //       category: "",
  //       minBidAmount: "",
  //       maxBidAmount: "",
  //       bidOpeningDate: "",
  //       bidClosingDate: "",
  //     });
  //   } catch (err) {
  //     console.error("Error submitting tender:", err);
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:text-3xl text-2xl font-bold mb-8 text-center"
        >
          Create Tender
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg w-full border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-6">Enter Tender Details</h2>

          <div className="grid gap-4">
            {[
              {
                label: "Tender Title",
                name: "title",
                placeholder: "Tender Title",
              },
              {
                label: "Tender Description",
                name: "description",
                placeholder: "Description",
                type: "textarea",
              },
              { label: "Category", name: "category", placeholder: "Category" },
              {
                label: "Min Bid Amount",
                name: "minBidAmount",
                placeholder: "Min Bid Amount",
                type: "number",
              },
              {
                label: "Max Bid Amount",
                name: "maxBidAmount",
                placeholder: "Max Bid Amount",
                type: "number",
              },
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
              {
                label: "Work Location",
                name: "location",
                placeholder: "Work Location",
              },
            ].map(({ label, name, placeholder, type = "text" }, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mt-2"
              >
                <label className="block font-semibold text-gray-300 mb-2">
                  {label}
                </label>
                {type === "textarea" ? (
                  <textarea
                    name={name}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-700 bg-[#0f1224] p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition"
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
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
