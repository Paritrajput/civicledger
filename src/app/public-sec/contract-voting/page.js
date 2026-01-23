"use client";

import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import MilestoneTracker from "@/Components/People/voting";
import ProtectedRoute from "@/Components/ProtectedRoutes/protected-routes";
export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
      <AdminPaymentPage />
    </Suspense>
  );
}
export const AdminPaymentPage = () => {
  const searchParams = useSearchParams();
  const contractParam = searchParams.get("contract");
  const contractData = contractParam
    ? JSON.parse(decodeURIComponent(contractParam))
    : null;

  console.log(contractData);
  console.log("Contract Data milestones:", contractData.milestones);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestedPayments, setRequestedPayments] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [myTender, setMyTender] = useState(null);
  const [contractor, setContractor] = useState(null);
  const [contractorRating, setContractorRating] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [vote, setVote] = useState("approve");
  const [review, setReview] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = () => {
    console.log("Vote:", vote);
    console.log("Review:", review);
    console.log("Image:", image);
    // You can now send this data to your backend
    setShowModal(false);
  };

  useEffect(() => {
    const fetchContractor = async () => {
      if (!contractData.winner) return;

      try {
        console.log(contractData.winner);
        const response = await axios.post("/api/contractor/get-profile", {
          contractorId: contractData.winner,
        });
        console.log("Contractor Data:", response.data);

        setContractor(response.data);
        setContractorRating(response.data.contractorRating);
      } catch (error) {
        console.error("Could not get contractor", error);
        setError("Could not get contractor");
      } finally {
        setLoading(false);
      }
    };

    fetchContractor();
  }, [contractData.winner]);

  const [newRating, setNewRating] = useState("");

  const submitRating = async () => {
    if (!newRating || newRating < 1 || newRating > 5) {
      alert("Please enter a valid rating between 1 and 5.");
      return;
    }

    try {
      await axios.post("/api/contractor/rating", {
        contractorId: contractData.winner,
        userId: "currentUserId",
        rating: parseInt(newRating),
      });
      alert("Rating submitted!");

      setNewRating("");
    } catch (error) {
      console.error("Failed to submit rating", error);
      alert("Failed to submit rating.");
    }
  };

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await axios.get("/api/tender/get-tender");
        setTenders(response.data);
        console.log("Tenders Data:", response.data);
      } catch (error) {
        console.error("Could not get tenders", error);
        setError("Could not get tenders");
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  useEffect(() => {
    if (tenders.length > 0) {
      const foundTender = tenders.find((m) => m._id === contractData.tenderId);
      setMyTender(foundTender);
    }
  }, [tenders, contractData.tenderId]);

  const getPayments = async () => {
    if (!contractData._id) return;

    try {
      const response = await fetch(
        `/api/payment/get-payments/${contractData._id}`,
        {
          method: "GET",
        },
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Payments Data:", data);
        setRequestedPayments(data);
      } else {
        setError("No payment history found.");
      }
    } catch (error) {
      console.error("Failed to fetch payments", error);
      setError("Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPayments();
  }, [contractData._id]);

  const totalPaymentsMade = requestedPayments.reduce(
    (sum, payment) => sum + payment.paymentMade,
    0,
  );
  const progressPercentage = contractData.bidAmount
    ? (totalPaymentsMade / contractData.bidAmount) * 100
    : 0;

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen text-white">
        <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
        <div className="relative p-4 md:p-6">
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-6"
          >
            Contract Details
          </motion.h1>

          {contractor ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md mb-6 flex max-md:flex-col gap-5 md:gap-20 border border-gray-800"
            >
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Contractor Details
                </h2>
                <p className="text-gray-300">Name: {contractor.name}</p>
                <p className="text-gray-300">Email: {contractor.email}</p>
                <p className="text-gray-300">
                  Experience: {contractor.experienceYears || 0} years
                </p>
                <p className="text-yellow-400 font-semibold mt-2">
                  Rating: {contractorRating || 0} ⭐
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Rate the Contractor
                </h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="p-3 bg-[#0f1224] border border-gray-700 text-white rounded-xl focus:outline-none focus:border-gray-500"
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black px-6 py-3 rounded-xl font-semibold transition"
                    onClick={submitRating}
                  >
                    Submit Rating
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <p className="text-gray-400 text-center">
              Loading contractor details...
            </p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md mb-6 border border-gray-800"
          >
            <h2 className="text-2xl font-semibold mb-4">Contract Details</h2>
            <p className="text-gray-300 break-all">ID: {contractData._id}</p>
            <p className="text-gray-300">
              Contract Title: {myTender?.title || "N/A"}
            </p>
            <p className="text-gray-300">
              Contract Description: {myTender?.description || "N/A"}
            </p>
            <p className="text-gray-300">
              Total Budget: ₹{contractData.bidAmount}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md mb-6 border border-gray-800"
          >
            <h3 className="text-lg font-semibold mb-4">Contract Progress</h3>
            <div className="w-full bg-gray-800/50 h-4 rounded-full overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              ></motion.div>
            </div>
            <p className="text-gray-300 mt-3">
              {progressPercentage.toFixed(2)}% Completed
            </p>
          </motion.div>

          <MilestoneTracker contractData={contractData} />

          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold text-white mb-6 text-center"
          >
            Payment History
          </motion.h2>
          {loading ? (
            <p className="text-center text-gray-400">Loading payments...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : requestedPayments.filter(
              (payment) => payment.status === "Completed",
            ).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requestedPayments
                .filter((payment) => payment.status === "Completed")
                .map((payment, idx) => (
                  <motion.div
                    key={payment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md border border-gray-800 hover:border-gray-600 transition"
                  >
                    <p className="text-lg font-semibold break-all">
                      ID: {payment._id}
                    </p>
                    <p className="text-gray-300 mt-3">
                      Bid Amount: ₹{payment.bidAmount}
                    </p>
                    <p className="text-gray-300">
                      Payment Requested: ₹{payment.paymentMade}
                    </p>
                    <p className="text-gray-300">Reason: {payment.reason}</p>
                    <p className="text-yellow-400 font-medium mt-2">
                      Status: {payment.status}
                    </p>
                  </motion.div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">
              No payment history found.
            </p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};
