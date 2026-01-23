"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const AdminPaymentPage = (contract) => {
  const contractData = contract.contract;
  const [loading, setLoading] = useState(true);
  const [requestedPayments, setRequestedPayments] = useState([]);
  const [error, setError] = useState("");

  const getPayments = async () => {
    const contractId = contractData._id;

    try {
      const response = await fetch(`/api/payment/get-payments/${contractId}`);
      const data = await response.json();
      if (data) {
        setRequestedPayments(data);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Payment fetch failed", error);
      setError("Failed to fetch payment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPayments();
  }, []);

  const handleAction = async (action, paymentId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment/approve-payment/${paymentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Payment ${action}d successfully!`);
        getPayments(); // Refresh the list
      } else {
        alert(data.message || `Failed to ${action} payment`);
      }
    } catch (error) {
      console.error(`Error ${action}ing payment:`, error);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen text-white p-4 sm:p-6">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-center mb-6"
      >
        Admin Payment Dashboard
      </motion.h1>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800"
        >
          Loading payments...
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-500 bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800"
        >
          {error}
        </motion.div>
      ) : requestedPayments.filter((p) => p.status === "Pending").length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {requestedPayments
            .filter((p) => p.status === "Pending")
            .map((payment, index) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-[#14162d8a] backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-md border border-gray-800 hover:border-gray-600 transition"
              >
                <p className="text-sm sm:text-lg text-white font-semibold break-words">
                  ID: {payment.contractId}
                </p>
                <p className="text-gray-300 text-sm sm:text-base mt-2">
                  Bid Amount: ₹{payment.bidAmount}
                </p>
                <p className="text-gray-300 text-sm sm:text-base">
                  Requested: ₹{payment.paymentMade}
                </p>
                <p className="text-gray-300 text-sm sm:text-base">
                  Reason: {payment.reason}
                </p>
                <p className="text-gray-300 text-sm sm:text-base">
                  Votes - Approvals: {payment.approvalVotes?.length},
                  Rejections: {payment.rejectionVotes?.length}
                </p>
                <p className="text-gray-400 font-semibold mt-3 text-sm sm:text-base">
                  Status: {payment.status}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 justify-between mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAction("Approve", payment._id)}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-white text-black rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Approve"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAction("Deny", payment._id)}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Deny"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800"
        >
          No pending payments found.
        </motion.div>
      )}
    </div>
  );
};

export default AdminPaymentPage;
