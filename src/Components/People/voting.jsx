"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const MilestoneTracker = ({ contractData }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [contractId, setContractId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [vote, setVote] = useState("approve");
  const [review, setReview] = useState("");
  const [image, setImage] = useState(null);
  const [requestedPayments, setRequestedPayments] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [myTender, setMyTender] = useState(null);
  const [contractor, setContractor] = useState(null);

  const getPayments = async () => {
    if (!contractData._id) return;

    try {
      const response = await fetch(
        `/api/payment/get-payments/${contractData._id}`,
        {
          method: "GET",
        }
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

  useEffect(() => {
    if (contractData) {
      // setMilestones(contractData.milestones);
      setContractId(contractData._id);
      setLoading(false);
    }
  }, [contractData]);

  // Timer to update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Separate function for vote status check
  const voteStatus = async (contractId, index) => {
    try {
      await axios.post("/api/contract-voting/public-voting", {
        contractId,
        index,
      });
      // console.log(`Checked vote status for milestone ${index}`);
    } catch (error) {
      console.error("Auto vote status failed", error);
    }
  };

  // Trigger voteStatus after deadline + 12 hrs
  // useEffect(() => {
  //   const checkMilestoneVotes = async () => {
  //     if (!milestones || milestones.length === 0) return;

  //     for (let i = 0; i < milestones.length; i++) {
  //       const milestone = milestones[i];
  //       const deadline = new Date(milestone.dueDate);
  //       const timeDiff = (currentTime - deadline) / 1000;
  //       const isClosingTime = timeDiff >= 12 * 3600;

  //       if (isClosingTime && milestone.status !== "Closed") {
  //         await voteStatus(contractId, i);
  //       }
  //     }
  //   };

  //   checkMilestoneVotes();
  // }, [currentTime, milestones, contractId]);

  const [selectedPayment, setSelectedPayment] = useState(null);

  // Open Modal & Set Selected Payment
  const openVoteModal = (payment) => {
    console.log(payment);
    setSelectedPayment(payment);
    setShowModal(true);
  };

  // Submit Vote
  const handleSubmit = async () => {
    if (!selectedPayment) return alert("No payment selected.");

    const formData = new FormData();
    formData.append("contractId", contractId);
    formData.append("paymentId", selectedPayment._id);
    formData.append("contractorId", selectedPayment.contractorId);
    formData.append("vote", vote);
    formData.append("review", review);
    if (image) formData.append("image", image);

    try {
      const response = await axios.put(
        "/api/contract-voting/public-voting",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      if (response.status == 200) {
        alert("Vote submitted successfully!");
        setShowModal(false);
        getPayments();
      }
    } catch (err) {
      console.error("Vote submission failed:", err);
      alert("Failed to submit vote.");
    }
  };

  return (
    <div className="bg-transparent text-white md:p-6 p-3">
      <h2 className="md:text-2xl text-xl font-semibold text-white mb-6">
        Payment Requested
      </h2>
      {loading ? (
        <p className="text-center text-gray-400">Loading payments...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : requestedPayments.filter((payment) => payment.status === "Pending")
          .length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requestedPayments
            .filter((payment) => payment.status === "Pending")
            .map((payment, idx) => {
              const paymentTime = new Date(payment.createdAt);
              const timeSinceRequest =
                (new Date() - paymentTime) / (1000 * 60 * 60);
              const votingAvailable = timeSinceRequest <= 0.8;
              return (
                <motion.div
                  key={payment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#14162d8a] backdrop-blur-xl md:p-6 p-4 rounded-2xl shadow-lg border border-gray-800 hover:border-gray-600 transition"
                >
                  <p className="text-lg font-semibold text-white break-all">
                    ID: <span className="text-sm">{payment._id}</span>
                  </p>
                  <p className="text-gray-300 mt-3">
                    <strong>Bid Amount:</strong> ₹{payment.bidAmount}
                  </p>
                  <p className="text-gray-300">
                    <strong>Payment Requested:</strong> ₹{payment.paymentMade}
                  </p>
                  {payment.progress && (
                    <p className="text-gray-300">
                      <strong>Work Progress:</strong> {payment.progress}
                    </p>
                  )}
                  <p className="text-gray-300">
                    <strong>Reason:</strong> {payment.reason}
                  </p>
                  <p className="text-yellow-400 font-medium mt-2">
                    Status: {payment.status}
                  </p>
                  <div className="mt-4">
                    {Math.max(0, 0.8 - timeSinceRequest).toFixed(1) > 0 && (
                      <p className="text-sm text-gray-400 mb-3">
                        Time left:{" "}
                        <span className="font-semibold">
                          {Math.max(0, 0.8 - timeSinceRequest).toFixed(1)} hrs
                        </span>
                      </p>
                    )}
                    <div className="flex gap-4">
                      {votingAvailable ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openVoteModal(payment)}
                          className="bg-white text-black px-4 py-2 rounded-lg font-semibold transition hover:shadow-lg"
                        >
                          Vote
                        </motion.button>
                      ) : (
                        <p className="text-red-400 font-medium">Voting Over</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      ) : (
        <p className="text-center text-gray-400">No pending payment found.</p>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#14162d8a] backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-800"
          >
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Cast Your Vote
            </h2>

            <div className="mb-6">
              <label className="block mb-3 font-medium text-white">Decision:</label>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="vote"
                    value="approve"
                    checked={vote === "approve"}
                    onChange={(e) => setVote(e.target.value)}
                    className="mr-3 w-4 h-4 accent-white"
                  />
                  <span>Approve</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="vote"
                    value="reject"
                    checked={vote === "reject"}
                    onChange={(e) => setVote(e.target.value)}
                    className="mr-3 w-4 h-4 accent-white"
                  />
                  <span>Reject</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-3 font-medium text-white">Review:</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review..."
                className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
                rows={3}
              />
            </div>

            <div className="mb-6">
              <label className="block mb-3 font-medium text-white">
                Upload Progress Image:
              </label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white focus:outline-none file:bg-white file:text-black file:px-3 file:py-1 file:rounded-lg file:border-0 file:cursor-pointer"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="px-4 py-2 bg-white text-black rounded-lg hover:shadow-lg transition font-semibold"
              >
                Submit Vote
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker;
