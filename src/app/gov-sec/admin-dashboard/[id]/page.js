"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function OwnerDashboard() {
  const { id } = useParams(); // Get ownerId from URL
  const [adminRequest, setAdminRequest] = useState(null);
  const [adminDetails, setAdminDetails] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  console.log(id);

  useEffect(() => {
    if (id) {
      fetchAdminRequest();
    }
  }, [id]);

  // Fetch admin request for this owner
  const fetchAdminRequest = async () => {
    try {
      const res = await axios.get(`/api/admin?userId=${id}`);
      if (res.data.request) {
        setAdminRequest(res.data.request);
        if (res.data.request.approved) {
          fetchAdminDetails(res.data.request.adminId);
        }
      }
    } catch (error) {
      console.error("Error fetching admin request", error);
    }
  };

  // Fetch admin details if request is approved
  const fetchAdminDetails = async (adminId) => {
    try {
      const res = await axios.get(`/api/admins/${adminId}`);
      setAdminDetails(res.data);
    } catch (error) {
      console.error("Error fetching admin details", error);
    }
  };

  // Send approval request
  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/admin", { ...formData, userId: id });
      setAdminRequest(res.data); // Update state with the newly created request
      alert("Approval request sent successfully!");
    } catch (error) {
      console.error("Error sending request", error);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3 max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6"
        >
          Admin Approval
        </motion.h1>

        {adminRequest ? (
          adminRequest.approved ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md border border-gray-800"
            >
              <h2 className="text-xl font-semibold mb-4">Admin Details</h2>
              {adminDetails ? (
                <div className="space-y-3">
                  <p className="font-semibold text-white">
                    Name: {adminDetails.name}
                  </p>
                  <p className="text-gray-300">Email: {adminDetails.email}</p>
                </div>
              ) : (
                <p className="text-gray-400">Fetching admin details...</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md border border-gray-800"
            >
              <h2 className="text-xl font-semibold mb-4">
                Approval Request Sent
              </h2>
              <p className="text-gray-300">Your request is pending approval.</p>
            </motion.div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-6">
              Request Admin Approval
            </h2>
            <form onSubmit={handleSendRequest} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 text-white rounded-xl focus:outline-none focus:border-gray-500 transition"
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 text-white rounded-xl focus:outline-none focus:border-gray-500 transition"
                  required
                />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-white text-black px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition mt-6"
              >
                Send Request
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
