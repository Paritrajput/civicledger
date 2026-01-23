"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function OwnerDashboard() {
  const params = useParams();
  const ownerId = params?.ownerId; // Safe access

  const [adminRequests, setAdminRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin");
      setAdminRequests(res.data.data);
    } catch (error) {
      console.error("Error fetching admin requests", error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    if (!ownerId) {
      alert("Owner ID not found.");
      return;
    }

    try {
      const response = await axios.post(`/api/admin/${id}`, { ownerId });
      console.log(response.data);
      setAdminRequests((prev) => prev.filter((req) => req._id !== id));
      alert("Admin request approved!");
    } catch (error) {
      console.error("Error approving admin", error);
    }
  };

  useEffect(() => {
    fetchAdminRequests();
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3 max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          Pending Admin Requests
        </motion.h2>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 text-center"
          >
            <p className="text-gray-400">Loading requests...</p>
          </motion.div>
        ) : adminRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 text-center"
          >
            <p className="text-gray-300">No pending requests</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {adminRequests.map((admin, index) => (
              <motion.div
                key={admin._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#14162d8a] backdrop-blur-xl p-4 rounded-2xl border border-gray-800 hover:border-gray-600 transition"
              >
                <div>
                  <p className="font-semibold text-white">{admin.name}</p>
                  <p className="text-sm text-gray-400">{admin.email}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => approveRequest(admin._id)}
                  className="bg-white text-black px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Approve
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
